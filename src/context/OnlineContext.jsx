import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';

const OnlineContext = createContext();

export const useOnline = () => useContext(OnlineContext);

export const OnlineProvider = ({ children }) => {
    const [roomCode, setRoomCode] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const [onlineState, setOnlineState] = useState(null); // The game state synced from DB
    const [lastReaction, setLastReaction] = useState(null); // Ephemeral reaction event
    const [playerCount, setPlayerCount] = useState(0);
    const [error, setError] = useState(null);

    // Store latest state in ref to merge updates without dependency loops
    const onlineStateRef = useRef(null);
    useEffect(() => {
        onlineStateRef.current = onlineState;
    }, [onlineState]);

    const channelRef = useRef(null);

    // Generate a random 6-character code
    const generateCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const listenToRoom = (code) => {
        // Unsubscribe previous if exists
        if (channelRef.current) supabase.removeChannel(channelRef.current);

        const channel = supabase.channel(`room:${code}`);
        channelRef.current = channel;

        // 1. Listen for Broadcast (Reactions)
        channel.on('broadcast', { event: 'reaction' }, ({ payload }) => {
            setLastReaction(payload);
        });

        // 2. Listen for Database Changes (Game State)
        channel.on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `code=eq.${code}` },
            (payload) => {
                const newData = payload.new;
                if (newData) {
                    // Check if players count changed
                    if (newData.players_count !== playerCount) {
                        setPlayerCount(newData.players_count);
                    }
                    // Update game state
                    if (newData.game_state) {
                        setOnlineState(newData.game_state);
                    }
                }
            }
        ).subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('Connected to Supabase Realtime');
            }
        });
    };

    const createRoom = async () => {
        const code = generateCode();
        try {
            const initialState = {
                currentCardIndex: 0,
                currentPlayer: 1,
                timestamp: Date.now()
            };

            const { error: insertError } = await supabase
                .from('rooms')
                .insert({
                    code,
                    host_id: 'host', // Ideally use Auth ID
                    players_count: 1,
                    game_state: initialState
                });

            if (insertError) throw insertError;

            setRoomCode(code);
            setIsHost(true);
            setOnlineState(initialState);
            listenToRoom(code);
            return code;
        } catch (e) {
            console.error("Supabase Error", e);
            setError("Erro ao criar sala.");
            return null;
        }
    };

    const joinRoom = async (code) => {
        try {
            // Check if room exists
            const { data, error: fetchError } = await supabase
                .from('rooms')
                .select('*')
                .eq('code', code)
                .single();

            if (fetchError || !data) {
                console.error("Join Room Error:", fetchError || "Room data is null");
                setError("Sala não encontrada (Verifique o código).");
                return false;
            }

            // Update player count
            await supabase
                .from('rooms')
                .update({ players_count: 2 })
                .eq('code', code);

            setRoomCode(code);
            setIsHost(false);
            setOnlineState(data.game_state);
            listenToRoom(code);
            return true;
        } catch (e) {
            console.error(e);
            setError("Erro ao entrar na sala.");
            return false;
        }
    };

    const updateOnlineGame = async (updates) => {
        if (!roomCode) return;

        // Merge with current state (optimistic)
        const newState = { ...onlineStateRef.current, ...updates };

        // Optimistic update local
        setOnlineState(newState);

        // Send to DB
        await supabase
            .from('rooms')
            .update({ game_state: newState })
            .eq('code', roomCode);
    };

    const sendReaction = async (type) => {
        if (!roomCode || !channelRef.current) return;

        const payload = {
            type,
            id: Date.now(),
            sender: isHost ? 'host' : 'guest'
        };

        // Self-trigger locally for instant feedback
        setLastReaction(payload);

        // Broadcast to others
        await channelRef.current.send({
            type: 'broadcast',
            event: 'reaction',
            payload
        });
    };

    const leaveRoom = () => {
        if (channelRef.current) supabase.removeChannel(channelRef.current);
        setRoomCode(null);
        setOnlineState(null);
        setIsHost(false);
    };

    return (
        <OnlineContext.Provider value={{
            roomCode,
            isHost,
            onlineState,
            playerCount,
            createRoom,
            joinRoom,
            updateOnlineGame,
            sendReaction,
            lastReaction,
            leaveRoom,
            error
        }}>
            {children}
        </OnlineContext.Provider>
    );
};

import React, { createContext, useContext, useState } from 'react';
import { db } from '../services/firebase';
import { ref, set, onValue, update, get } from "firebase/database";

const OnlineContext = createContext();

export const useOnline = () => useContext(OnlineContext);

export const OnlineProvider = ({ children }) => {
    const [roomCode, setRoomCode] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const [onlineState, setOnlineState] = useState(null); // The game state synced from DB
    const [lastReaction, setLastReaction] = useState(null); // Ephemeral reaction event
    const [playerCount, setPlayerCount] = useState(0);
    const [error, setError] = useState(null);

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
        const roomRef = ref(db, `rooms/${code}`);
        onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setOnlineState(data.gameState);
                setPlayerCount(data.players);
                // Listen to reaction changes if they exist outside gameState
                if (data.reaction) {
                    setLastReaction(data.reaction);
                }
            }
        });
    };

    const createRoom = async () => {
        const code = generateCode();
        try {
            await set(ref(db, 'rooms/' + code), {
                host: true,
                players: 1,
                gameState: {
                    currentCardIndex: 0,
                    currentPlayer: 1,
                    timestamp: Date.now()
                }
            });
            setRoomCode(code);
            setIsHost(true);
            listenToRoom(code);
            return code;
        } catch (e) {
            console.error("Firebase Error", e);
            setError("Erro ao conectar com Firebase. Verifique a configuração.");
            return null;
        }
    };

    const joinRoom = async (code) => {
        const roomRef = ref(db, `rooms/${code}`);
        try {
            const snapshot = await get(roomRef);
            if (snapshot.exists()) {
                await update(roomRef, {
                    players: 2
                });
                setRoomCode(code);
                setIsHost(false);
                listenToRoom(code);
                return true;
            } else {
                console.error("Room not found");
                setError("Sala não encontrada (Verifique o código).");
                return false;
            }
        } catch (e) {
            console.error(e);
            setError("Erro ao entrar na sala.");
            return false;
        }
    };

    const updateOnlineGame = (newGameState) => {
        if (!roomCode) return;
        update(ref(db, `rooms/${roomCode}/gameState`), newGameState);
    };

    const sendReaction = (type) => {
        if (!roomCode) return;
        // We set a unique ID so every click triggers a change even if same type
        set(ref(db, `rooms/${roomCode}/reaction`), {
            type,
            id: Date.now(),
            sender: isHost ? 'host' : 'guest'
        });
    };

    const leaveRoom = () => {
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

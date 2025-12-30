import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnline } from '../context/OnlineContext';
import { useGame } from '../context/GameContext';
import { Button } from '../components/Button';
import { ArrowLeft, Copy, Users, User, QrCode, ScanLine, Settings } from 'lucide-react'; // Added icons
import { useUser } from '../context/UserContext';
import QRCode from "react-qr-code"; // Generator
import { Html5Qrcode } from "html5-qrcode"; // Use the lower level API

export const LobbyScreen = () => {
    const { createRoom, joinRoom, roomCode, isHost, playerCount, error, updateOnlineGame } = useOnline();
    const { setGameState, playerNames, setPlayerNames } = useGame();

    const { profile } = useUser();
    const [mode, setMode] = useState('menu'); // menu, create, join
    const [inputCode, setInputCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false); // Toggle scanner

    useEffect(() => {
        if (playerCount === 2 && roomCode) {
            // Game Start sync logic will happen here or in GameContext
            // For now, let's manual start or auto trigger
        }
    }, [playerCount, roomCode]);

    const handleCreate = async () => {
        setLoading(true);
        setPlayerNames(prev => ({ ...prev, 1: profile.nickname }));
        const code = await createRoom();
        if (code) {
            setMode('waiting');
        }
        setLoading(false);
    };

    const handleJoin = async () => {
        if (inputCode.length !== 6) return;
        setLoading(true);
        setPlayerNames(prev => ({ ...prev, 2: profile.nickname }));
        const cleanCode = inputCode.trim().toUpperCase();
        const success = await joinRoom(cleanCode);
        if (success) {
            // Sync my name to the host
            // Need to call a sync function in OnlineContext or just use updateOnlineGame directly
            // Since updateOnlineGame updates 'gameState', we can piggyback or better, specific update
            // But updateOnlineGame uses roomCode state which might not be set instantly? 
            // joinRoom handles setting roomCode, but react state is async.
            // Let's rely on a separate useEffect or assume functionality.
            // Actually, joinRoom returns success, so we can try updating.
            // BUT wait, updateOnlineGame depends on roomCode which is state.
            // Workaround: We will update name in "waiting" mode useEffect or just force sync now if we could.
            setMode('waiting');
        }
        setLoading(false);
    };

    useEffect(() => {
        let html5QrCode;
        if (showScanner) {
            html5QrCode = new Html5Qrcode("reader");
            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    html5QrCode.stop().then(() => {
                        setShowScanner(false);
                        setInputCode(decodedText.trim().toUpperCase());
                    }).catch(err => console.error(err));
                },
                (errorMessage) => {
                    // console.log(errorMessage);
                }
            ).catch((err) => {
                console.error("Erro ao iniciar câmera", err);
            });

            return () => {
                if (html5QrCode && html5QrCode.isScanning) {
                    html5QrCode.stop().catch(err => console.error(err));
                }
            };
        }
    }, [showScanner]);

    // Sync P2 Name when joined
    useEffect(() => {
        if (!isHost && roomCode && mode === 'waiting' && profile?.nickname) {
            updateOnlineGame({ playerNames: { ...playerNames, 2: profile.nickname } });
        }
    }, [roomCode, mode, isHost, profile?.nickname, playerNames, updateOnlineGame]);

    useEffect(() => {
        if (isHost && roomCode && mode === 'waiting' && profile?.nickname) {
            updateOnlineGame({ playerNames: { ...playerNames, 1: profile.nickname } });
        }
    }, [roomCode, mode, isHost, profile?.nickname, playerNames, updateOnlineGame]);

    const copyCode = () => {
        navigator.clipboard.writeText(roomCode);
        alert('Código copiado!');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 w-full">
            <div className="flex items-center w-full mb-4">
                <button onClick={() => setGameState('home')} className="p-2 text-white/50 hover:text-white">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-serif text-white ml-2">Modo Online</h2>
            </div>

            <AnimatePresence mode='wait'>
                {mode === 'menu' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="flex flex-col gap-4 w-full"
                    >
                        <div className="bg-white/10 p-4 rounded-2xl flex items-center justify-between border border-white/10 group mb-2">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${profile?.color || 'from-rose-500 to-pink-600'} flex items-center justify-center text-2xl shadow-lg ring-2 ring-white/20`}>
                                    {profile?.avatar || '💖'}
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] uppercase tracking-widest text-rose-300 font-bold opacity-60">Perfil Ativo</p>
                                    <p className="text-white font-medium text-lg leading-tight">{profile?.nickname}</p>
                                </div>
                            </div>
                        </div>

                        <Button onClick={handleCreate} className="w-full">
                            Criar Sala
                        </Button>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setMode('join')} className="flex-1">
                                Digitar Código
                            </Button>
                            <Button variant="secondary" onClick={() => {
                                if (!profile?.nickname) return;
                                setMode('join');
                                setShowScanner(true);
                            }} className="flex-1 flex items-center justify-center gap-2">
                                <ScanLine className="w-4 h-4" />
                                <span>Escanear QR</span>
                            </Button>
                        </div>
                    </motion.div>
                )}

                {mode === 'join' && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="flex flex-col gap-4 w-full"
                    >
                        <div className="bg-white/10 p-4 rounded-2xl flex items-center justify-between border border-white/10 group mb-2">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${profile?.color || 'from-rose-500 to-pink-600'} flex items-center justify-center text-2xl shadow-lg ring-2 ring-white/20`}>
                                    {profile?.avatar || '💖'}
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] uppercase tracking-widest text-rose-300 font-bold opacity-60">Perfil Ativo</p>
                                    <p className="text-white font-medium text-lg leading-tight">{profile?.nickname}</p>
                                </div>
                            </div>
                        </div>

                        {showScanner ? (
                            <div className="w-full bg-black/80 rounded-2xl overflow-hidden border border-white/20 p-2 relative">
                                <div id="reader" className="w-full rounded-xl overflow-hidden aspect-square" />
                                <div className="absolute inset-x-0 bottom-4 flex justify-center px-4">
                                    <Button variant="outline" onClick={() => setShowScanner(false)} className="w-full bg-white/10 backdrop-blur-md border-white/20">
                                        Cancelar
                                    </Button>
                                </div>
                                <style>{`
                                    #reader video {
                                        width: 100% !important;
                                        height: 100% !important;
                                        object-fit: cover !important;
                                        border-radius: 0.75rem;
                                    }
                                    #reader__scan_region {
                                        background: transparent !important;
                                    }
                                `}</style>
                            </div>
                        ) : (
                            <Button variant="ghost" onClick={() => setShowScanner(true)} className="text-rose-200 text-sm flex items-center gap-2 mx-auto mb-2">
                                <ScanLine className="w-4 h-4" />
                                <span>Usar Câmera</span>
                            </Button>
                        )}

                        {!showScanner && (
                            <input
                                type="text"
                                placeholder="DIGITE O CÓDIGO (6 LETRAS)"
                                className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white text-center font-mono text-xl uppercase placeholder:text-white/30 focus:outline-none focus:border-brand-primary"
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                                maxLength={6}
                            />
                        )}
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        <Button onClick={handleJoin} disabled={loading || inputCode.length < 6 || !profile?.nickname} className="w-full">
                            {loading ? 'Entrando...' : 'Conectar'}
                        </Button>
                    </motion.div>
                )}

                {mode === 'waiting' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full bg-black/20 p-6 rounded-2xl border border-white/10"
                    >
                        <p className="text-white/60 text-sm uppercase tracking-widest mb-2">CÓDIGO DA SALA</p>
                        <div className="flex items-center justify-center space-x-2 mb-6" onClick={copyCode}>
                            <span className="text-4xl font-mono font-bold text-white tracking-widest">{roomCode}</span>
                            <Copy className="w-5 h-5 text-white/50" />
                        </div>

                        <div className="bg-white p-4 rounded-xl mx-auto mb-6 w-fit">
                            <QRCode
                                size={128}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                value={roomCode || ""}
                                viewBox={`0 0 128 128`}
                            />
                        </div>
                        <p className="text-white/30 text-xs mb-4">Peça para seu par escanear este código</p>

                        <div className="flex flex-col items-center space-y-2">
                            <Users className="w-8 h-8 text-rose-300" />
                            <p className="text-white text-lg">
                                {playerCount === 1 ? 'Aguardando jogador 2...' : 'Jogador 2 conectado!'}
                            </p>
                        </div>

                        {playerCount === 2 && isHost && (
                            <Button onClick={() => setGameState('setup')} className="mt-8 w-full animate-pulse">
                                Configurar Jogo
                            </Button>
                        )}
                        {playerCount === 2 && !isHost && (
                            <p className="mt-8 text-white/50 text-sm animate-pulse">
                                O anfitrião está configurando o jogo...
                            </p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

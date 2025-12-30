import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Repeat, Home, PlayCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { useGame } from '../context/GameContext';

export const EndScreen = () => {
    const { favorites, sessionStats, historyStats, resetGame, restartGame, isHost, roomCode } = useGame();

    const handleShare = () => {
        const text = "Acabei de jogar *Puxa Conversa Casal* e foi incrível! ❤️\nRecomendo demais para conectar com o crush.";
        const url = window.location.href;
        window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, '_blank');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
            >
                <h2 className="text-4xl font-serif text-white">Fim da Rodada!</h2>
                <p className="text-white/70 max-w-xs mx-auto text-lg leading-relaxed">
                    "O amor não consiste em olhar um para o outro, mas sim em olhar juntos para a mesma direção."
                </p>
                <div className="h-px w-20 bg-white/20 mx-auto my-6" />

                {/* Stats Card */}
                <div className="bg-white/10 p-6 rounded-2xl border border-white/20 w-full backdrop-blur-sm">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-3xl font-bold text-white">{sessionStats.cardsPlayed}</p>
                            <p className="text-xs uppercase tracking-widest text-rose-200">Cartas Hoje</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{sessionStats.likesGiven}</p>
                            <p className="text-xs uppercase tracking-widest text-rose-200">Ameis Hoje</p>
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-4 mt-2">
                        <p className="text-white/50 text-xs">Total Histórico: {historyStats.totalCards} cartas jogadas</p>
                    </div>
                </div>

                {favorites.length > 0 && (
                    <div className="bg-white/10 p-6 rounded-2xl w-full border border-white/10">
                        <h3 className="text-rose-200 font-bold uppercase tracking-wider text-sm mb-4">Desafio Final</h3>
                        <p className="text-white text-lg font-serif">
                            Dêem um abraço de 1 minuto em silêncio agora. ❤️
                        </p>
                    </div>
                )}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-xs space-y-3"
            >
                <Button onClick={handleShare} variant="secondary" className="w-full flex items-center justify-center space-x-2">
                    <Share2 className="w-4 h-4" />
                    <span>Compartilhar</span>
                </Button>

                {/* Show Restart only for Host or Offline */}
                {(!roomCode || isHost) && (
                    <Button onClick={restartGame} className="w-full flex items-center justify-center space-x-2 animate-pulse">
                        <PlayCircle className="w-4 h-4" />
                        <span>Jogar Novamente</span>
                    </Button>
                )}

                <div className="flex space-x-3 mt-4">
                    <Button onClick={resetGame} variant="outline" className="flex-1 flex items-center justify-center space-x-2">
                        <Home className="w-4 h-4" />
                        <span>Início</span>
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

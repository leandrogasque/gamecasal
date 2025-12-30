import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, User, Sparkles, Layers } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useGame } from '../context/GameContext';
import { useReactions } from '../context/ReactionContext';
import { FloatingReactions } from '../components/FloatingReactions';

export const GameScreen = () => {
    const {
        currentCard,
        nextCard,
        currentPlayer,
        deck,
        currentCardIndex,
        favorites,
        toggleFavorite,
        resetGame,
        isRevealed,
        revealCard,
        playerNames,
        gameState,
        gameMode,
        intimacyLevel,
        upgradeLevel,
        isHost,
        roomCode
    } = useGame();

    const { triggerReaction } = useReactions();
    const [showLevelUp, setShowLevelUp] = React.useState(false);

    // Watch for level changes to show overlay
    React.useEffect(() => {
        if (intimacyLevel > 1) {
            setShowLevelUp(true);
            const timer = setTimeout(() => setShowLevelUp(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [intimacyLevel]);

    const isFavorite = favorites.some(f => f.id === currentCard?.id);
    const isLoading = gameState === 'playing' && deck.length === 0;

    if (isLoading) {
        return (
            <div className="flex flex-col h-full items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-rose-200 border-t-brand-primary rounded-full animate-spin" />
                <p className="text-white/50 text-sm animate-pulse">Embaralhando...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full relative">
            <FloatingReactions />

            {/* Header / Status */}
            <div className="flex justify-between items-center w-full mb-6">
                <Button variant="ghost" className="p-2" onClick={() => resetGame()}>
                    <span className="text-white/60 text-sm">Sair</span>
                </Button>

                <div className="bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm flex items-center gap-2">
                    {gameMode === 'progressive' && <Sparkles className="w-4 h-4 text-rose-300" />}
                    <span className="text-rose-200 font-bold tracking-widest text-sm uppercase">
                        {gameMode === 'progressive' ? `NÍVEL ${intimacyLevel}` : `VEZ DE ${playerNames?.[currentPlayer] || 'P' + currentPlayer}`}
                    </span>
                </div>
                <div className="w-6" /> {/* Spacer */}
            </div>

            {/* Turn Indicator */}
            <div className="text-center mb-8">
                <motion.div
                    key={currentPlayer}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center space-x-2 bg-white/5 px-4 py-1 rounded-full border border-white/10"
                >
                    <User className="w-4 h-4 text-rose-200" />
                    <span className="text-sm font-medium text-rose-100">
                        Vez do Jogador {currentPlayer}
                    </span>
                </motion.div>
            </div>

            {/* Card Area */}
            <div className="flex-1 flex items-center justify-center relative my-4">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentCard?.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -50, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                    >
                        {currentCard && (
                            <Card
                                data={currentCard}
                                onToggleFavorite={toggleFavorite}
                                isFavorite={isFavorite}
                                onSwipeLeft={nextCard}
                                onSwipeRight={(card) => {
                                    if (!isFavorite) toggleFavorite(card);
                                    setTimeout(nextCard, 500); // Wait for animation
                                }}
                                isRevealed={isRevealed}
                                onReveal={revealCard}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="py-6 space-y-4">
                {/* Reactions Bar */}
                <div className="flex justify-center gap-4 mb-2">
                    <button onClick={() => triggerReaction('love')} className="text-3xl hover:scale-125 transition-transform active:scale-95">❤️</button>
                    <button onClick={() => triggerReaction('laugh')} className="text-3xl hover:scale-125 transition-transform active:scale-95">😂</button>
                    <button onClick={() => triggerReaction('fire')} className="text-3xl hover:scale-125 transition-transform active:scale-95">🔥</button>
                    <button onClick={() => triggerReaction('wow')} className="text-3xl hover:scale-125 transition-transform active:scale-95">😮</button>
                    <button onClick={() => triggerReaction('applause')} className="text-3xl hover:scale-125 transition-transform active:scale-95">👏</button>
                </div>

                {gameMode === 'progressive' && intimacyLevel < 3 && (!roomCode || isHost) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pb-2"
                    >
                        <button
                            onClick={upgradeLevel}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-2xl text-rose-200 font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-colors"
                        >
                            <Sparkles className="w-4 h-4" />
                            Subir para Nível {intimacyLevel + 1}
                        </button>
                    </motion.div>
                )}

                <Button onClick={nextCard} className="w-full shadow-xl shadow-rose-900/20">
                    Próxima Carta
                </Button>
            </div>
            {/* Level Up Overlay */}
            <AnimatePresence>
                {showLevelUp && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.5, y: -100 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
                    >
                        <div className="bg-brand-primary/90 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl border-4 border-white/20 flex flex-col items-center space-y-4 max-w-[80%]">
                            <motion.div
                                animate={{ rotate: [0, 15, -15, 0] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                            >
                                <Sparkles className="w-16 h-16 text-yellow-300" />
                            </motion.div>
                            <div className="text-center">
                                <h3 className="text-3xl font-serif text-white mb-2">Nível {intimacyLevel}!</h3>
                                <p className="text-white/80 font-medium">As cartas agora estão mais {intimacyLevel === 2 ? 'profundas' : 'intensas'}... 🔥</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

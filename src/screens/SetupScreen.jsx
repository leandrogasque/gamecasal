import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Heart, Sparkles, User } from 'lucide-react';
import { Button } from '../components/Button';
import { useGame } from '../context/GameContext';
import { cn } from '../utils/cn';

const CATEGORIES = [
    { id: 'leve', label: 'Leve', color: 'bg-blue-400/20 border-blue-400/50' },
    { id: 'emocional', label: 'Emocional', color: 'bg-purple-400/20 border-purple-400/50' },
    { id: 'picante', label: 'Picante', color: 'bg-red-500/20 border-red-500/50' },
    { id: 'futuro', label: 'Futuro', color: 'bg-green-400/20 border-green-400/50' },
    { id: 'reflexao', label: 'Reflexão', color: 'bg-indigo-400/20 border-indigo-400/50' },
];

export const SetupScreen = () => {
    const { startGame, setGameState, playerNames, setPlayerNames, isHost, roomCode, gameMode, setGameMode } = useGame();
    const [selectedCategories, setSelectedCategories] = useState(['leve']);
    const [count, setCount] = useState(10);

    const toggleCat = (id) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleStart = () => {
        if (gameMode === 'custom' && selectedCategories.length === 0) return;
        startGame({
            mode: gameMode,
            categories: selectedCategories,
            questionCount: count,
            randomize: true
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-full space-y-8 py-4"
        >
            <div className="flex items-center space-x-4">
                <button onClick={() => setGameState('home')} className="p-2 -ml-2 text-white/50 hover:text-white transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-3xl font-serif text-white mb-2">Personalizar</h2>
            </div>

            {/* Game Mode Selector */}
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                <button
                    onClick={() => setGameMode('progressive')}
                    className={cn(
                        "flex-1 py-3 px-4 rounded-xl text-sm font-bold uppercase tracking-wider transition-all",
                        gameMode === 'progressive' ? "bg-rose-500 text-white shadow-lg" : "text-white/40 hover:text-white/60"
                    )}
                >
                    Modo Progressivo
                </button>
                <button
                    onClick={() => setGameMode('custom')}
                    className={cn(
                        "flex-1 py-3 px-4 rounded-xl text-sm font-bold uppercase tracking-wider transition-all",
                        gameMode === 'custom' ? "bg-rose-500 text-white shadow-lg" : "text-white/40 hover:text-white/60"
                    )}
                >
                    Modo Manual
                </button>
            </div>

            {gameMode === 'progressive' ? (
                <div className="p-6 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-center space-y-4">
                    <Sparkles className="w-10 h-10 text-rose-300 mx-auto" />
                    <h3 className="text-xl font-serif text-white">Modo Progressivo</h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                        O jogo começa leve e aumenta a intensidade gradualmente. Ideal para quem quer uma experiência guiada.
                    </p>
                </div>
            ) : (
                <p className="text-white/60">Escolha as categorias para sua rodada personalizada</p>
            )}

            <div className="w-full space-y-6 flex-1 overflow-y-auto pb-8 pr-1 custom-scrollbar">

                {/* Name Inputs */}
                <div className="space-y-3">
                    <label className="text-rose-200 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        <User className="w-4 h-4" /> Quem vai jogar?
                    </label>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Jogador 1"
                            className={cn(
                                "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-rose-300 transition-colors",
                                roomCode && "opacity-50 cursor-not-allowed"
                            )}
                            value={playerNames[1]}
                            onChange={(e) => !roomCode && setPlayerNames(prev => ({ ...prev, 1: e.target.value }))}
                            readOnly={!!roomCode}
                        />
                        <input
                            type="text"
                            placeholder="Jogador 2"
                            className={cn(
                                "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-rose-300 transition-colors",
                                roomCode && "opacity-50 cursor-not-allowed"
                            )}
                            value={playerNames[2]}
                            onChange={(e) => !roomCode && setPlayerNames(prev => ({ ...prev, 2: e.target.value }))}
                            readOnly={!!roomCode}
                        />
                    </div>
                </div>

                {gameMode === 'custom' && (
                    <>
                        {/* Categories */}
                        <section className="space-y-4">
                            <label className="text-sm font-bold tracking-widest text-white/50 uppercase">Categorias</label>
                            <div className="grid grid-cols-1 gap-3">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => toggleCat(cat.id)}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                                            selectedCategories.includes(cat.id)
                                                ? "bg-white/10 border-white/50 text-white"
                                                : "bg-transparent border-white/10 text-white/40"
                                        )}
                                    >
                                        <span className="font-medium text-lg">{cat.label}</span>
                                        {selectedCategories.includes(cat.id) && (
                                            <div className="w-6 h-6 rounded-full bg-white text-brand-primary flex items-center justify-center">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Count */}
                        <section className="space-y-4">
                            <label className="text-sm font-bold tracking-widest text-white/50 uppercase">Quantidade de Cartas</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[10, 20, 50].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setCount(num)}
                                        className={cn(
                                            "p-3 rounded-xl border font-bold text-lg transition-all",
                                            count === num
                                                ? "bg-white text-brand-dark border-white"
                                                : "bg-transparent text-white/50 border-white/10"
                                        )}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </div>

            <div className="pt-4">
                <Button onClick={handleStart} className="w-full" disabled={gameMode === 'custom' && selectedCategories.length === 0}>
                    Começar Jogo
                </Button>
            </div>
        </motion.div>
    );
};

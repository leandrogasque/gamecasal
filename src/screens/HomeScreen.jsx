import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Settings, Sparkles, Users } from 'lucide-react';
import { Button } from '../components/Button';
import { useGame } from '../context/GameContext';

export const HomeScreen = () => {
    const { setGameState } = useGame();

    return (
        <div className="flex flex-col items-center justify-start h-full py-4 text-center space-y-6 w-full overflow-y-auto no-scrollbar pb-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-4"
            >
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-rose-500/20">
                    <Heart className="w-10 h-10 text-rose-300 fill-current animate-pulse" />
                </div>
                <h1 className="text-5xl font-serif text-white tracking-tight">
                    Puxa<br />Conversa
                    <span className="block text-2xl mt-2 text-rose-200 font-sans tracking-widest font-light">CASAL</span>
                </h1>
                <p className="text-white/60 max-w-xs mx-auto text-sm leading-relaxed">
                    Conecte-se profundamente com quem você ama através de 100 perguntas exclusivas.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="flex flex-col gap-4 w-full max-w-xs"
            >
                <Button onClick={() => setGameState('setup')} className="w-full shadow-lg shadow-rose-900/40">
                    Jogar Agora
                </Button>
                <div className="flex gap-4">
                    <Button onClick={() => setGameState('lobby')} variant="secondary" className="flex-1 flex items-center justify-center gap-2">
                        <Users className="w-4 h-4" /> Online
                    </Button>
                    <Button onClick={() => setGameState('journey')} variant="secondary" className="flex-1 flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4 text-rose-300" /> Jornada
                    </Button>
                </div>
                <Button variant="outline" onClick={() => alert('Configurações em breve!')} className="w-full relative">
                    <Settings className="w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 opacity-50" />
                    Configurações
                </Button>
            </motion.div>

            <div className="absolute bottom-4 text-xs text-white/20">
                v1.0.0
            </div>
        </div>
    );
};

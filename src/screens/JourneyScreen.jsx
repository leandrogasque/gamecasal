import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles, BookOpen, Trophy, Info } from 'lucide-react';
import { Button } from '../components/Button';
import { useGame } from '../context/GameContext';
import { useUser } from '../context/UserContext';

export const JourneyScreen = () => {
    const { setGameState } = useGame();
    const { profile } = useUser();

    const stats = profile?.stats || { cardsPlayed: 0, likesGiven: 0, sessionsCompleted: 0 };
    const favorites = profile?.favorites || [];

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="bg-white/10 border border-white/10 p-4 rounded-3xl flex flex-col items-center space-y-2 text-center">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white leading-none mt-1">{value}</span>
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{label}</span>
        </div>
    );

    return (
        <div className="flex flex-col h-full space-y-8 py-4 w-full">
            <div className="flex items-center space-x-4">
                <button onClick={() => setGameState('home')} className="p-2 -ml-2 text-white/50 hover:text-white transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-left">
                    <h2 className="text-3xl font-serif text-white">Nossa Jornada</h2>
                    <p className="text-rose-300/60 text-sm font-medium">Memórias de vocês dois</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <StatCard
                    icon={BookOpen}
                    label="Cartas Lidas"
                    value={stats.cardsPlayed}
                    color="from-blue-500 to-indigo-600"
                />
                <StatCard
                    icon={Heart}
                    label="Curtidas"
                    value={stats.likesGiven}
                    color="from-rose-500 to-pink-600"
                />
                <StatCard
                    icon={Trophy}
                    label="Sessões"
                    value={stats.sessionsCompleted}
                    color="from-amber-500 to-orange-600"
                />
                <StatCard
                    icon={Sparkles}
                    label="Favoritos"
                    value={favorites.length}
                    color="from-purple-500 to-fuchsia-600"
                />
            </div>

            {/* Memories Section */}
            <div className="flex-1 overflow-hidden flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif text-white flex items-center gap-2">
                        <Heart className="w-5 h-5 text-rose-400" /> Galeria de Favoritos
                    </h3>
                    <span className="text-white/20 text-xs font-bold uppercase tracking-tighter">
                        {favorites.length} momentos
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar pb-10">
                    {favorites.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 opacity-40">
                            <Info className="w-12 h-12" />
                            <p className="text-sm">Vocês ainda não favoritaram nenhuma carta. Comece a jogar e marque os momentos que mais gostarem!</p>
                        </div>
                    ) : (
                        favorites.map((fav, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={fav.id}
                                className="bg-white/5 border border-white/10 p-5 rounded-3xl relative overflow-hidden group hover:bg-white/10 transition-colors"
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                    <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                                </div>
                                <span className={`text-[10px] uppercase tracking-widest font-black mb-2 block ${fav.category === 'picante' ? 'text-red-400' :
                                        fav.category === 'leve' ? 'text-blue-400' : 'text-purple-400'
                                    }`}>
                                    {fav.category}
                                </span>
                                <p className="text-white text-lg font-serif leading-snug">
                                    "{fav.text}"
                                </p>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

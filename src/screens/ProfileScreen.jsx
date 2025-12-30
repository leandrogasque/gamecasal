import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Heart, Sparkles, Check } from 'lucide-react';
import { Button } from '../components/Button';
import { useUser } from '../context/UserContext';

const AVATARS = ['💖', '🔥', '👩‍❤️‍👨', '💋', '🌹', '🥂', '🎭', '💎'];
const COLORS = [
    'from-rose-500 to-pink-600',
    'from-purple-500 to-indigo-600',
    'from-orange-500 to-rose-600',
    'from-emerald-500 to-teal-600'
];

export const ProfileScreen = ({ onComplete }) => {
    const { profile, updateProfile } = useUser();
    const [nickname, setNickname] = useState(profile?.nickname || '');
    const [avatar, setAvatar] = useState(profile?.avatar || AVATARS[0]);
    const [color, setColor] = useState(profile?.color || COLORS[0]);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!nickname.trim()) return alert('Escolha um apelido!');
        setIsSaving(true);
        try {
            await updateProfile({
                nickname: nickname.trim(),
                avatar,
                color,
                setupComplete: true
            });
            if (onComplete) onComplete();
        } catch (e) {
            console.error(e);
            alert('Erro ao salvar perfil.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-start h-full py-4 text-center space-y-8 w-full overflow-y-auto no-scrollbar pb-10">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-2"
            >
                <div className={`w-24 h-24 bg-gradient-to-br ${color} rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/20 shadow-xl text-5xl`}>
                    {avatar}
                </div>
                <h2 className="text-3xl font-serif text-white">Seu Perfil</h2>
                <p className="text-white/50 text-sm">Como você quer ser chamado(a)?</p>
            </motion.div>

            <div className="w-full max-w-xs space-y-6">
                {/* Nickname Input */}
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                        type="text"
                        placeholder="Seu Apelido"
                        className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-rose-400 focus:bg-white/15 transition-all text-lg"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        maxLength={15}
                    />
                </div>

                {/* Avatar Selection */}
                <div className="space-y-3">
                    <p className="text-xs uppercase tracking-widest text-rose-300 font-bold text-left px-1">Escolha um ícone</p>
                    <div className="grid grid-cols-4 gap-3">
                        {AVATARS.map((a) => (
                            <button
                                key={a}
                                onClick={() => setAvatar(a)}
                                className={`h-12 flex items-center justify-center rounded-xl text-2xl transition-all ${avatar === a ? 'bg-white/20 scale-110 ring-2 ring-rose-400' : 'bg-white/5 hover:bg-white/10'}`}
                            >
                                {a}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-3">
                    <p className="text-xs uppercase tracking-widest text-rose-300 font-bold text-left px-1">Cor do tema</p>
                    <div className="flex gap-3 justify-between">
                        {COLORS.map((c) => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                className={`w-full h-10 rounded-xl bg-gradient-to-br ${c} transition-all relative ${color === c ? 'ring-2 ring-white scale-105' : 'opacity-60 hover:opacity-100'}`}
                            >
                                {color === c && <Check className="w-5 h-5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4">
                    <Button onClick={handleSave} disabled={isSaving || !nickname} className="w-full py-4 shadow-lg shadow-rose-900/40">
                        {isSaving ? 'Salvando...' : 'Começar a Jogar'}
                    </Button>
                </div>
            </div>

            <p className="text-white/20 text-[10px] uppercase tracking-tighter">
                Seu progresso será salvo automaticamente
            </p>
        </div>
    );
};

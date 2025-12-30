import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReactions } from '../context/ReactionContext';

const EMOJI_MAP = {
    'love': '❤️',
    'laugh': '😂',
    'fire': '🔥',
    'wow': '😮',
    'applause': '👏'
};

export const FloatingReactions = () => {
    const { activeReactions } = useReactions();

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            <AnimatePresence>
                {activeReactions.map(reaction => (
                    <motion.div
                        key={reaction.id}
                        initial={{ opacity: 0, y: 100, x: reaction.x, scale: 0.5 }}
                        animate={{
                            opacity: [0, 1, 1, 0],
                            y: -400,
                            scale: [0.5, 1.5, 1],
                            rotate: Math.random() * 40 - 20
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute bottom-20 left-1/2 text-4xl transform -translate-x-1/2"
                        style={{ marginLeft: `${reaction.x}px` }} // Offset from center
                    >
                        {EMOJI_MAP[reaction.type] || '❤️'}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

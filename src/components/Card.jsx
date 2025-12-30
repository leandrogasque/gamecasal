import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from '../utils/cn';
import { useSound } from '../context/SoundContext';

export const Card = ({ data, onSwipeLeft, onSwipeRight, isFavorite, onToggleFavorite, isRevealed, onReveal }) => {
    // Local flipped state is now just a mirror of isRevealed prop, 
    // BUT we still need a local one if we want animations to work smoothly without context delay,
    // actually using the prop directly is better for sync.
    const flipped = isRevealed;
    const { playPop, playSuccess } = useSound();

    // Drag values
    const x = useMotionValue(0);
    const controls = useAnimation();

    // Rotation based on drag x
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    // Visual indicators opacity
    const likeOpacity = useTransform(x, [20, 150], [0, 1]);
    const nopeOpacity = useTransform(x, [-20, -150], [0, 1]);

    // Reset when card data changes
    useEffect(() => {
        // No need to setFlipped(false) locally, the parent controls it
        x.set(0);
    }, [data.id]);

    const handleDragEnd = async (event, info) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        if (offset > 100 || velocity > 500) {
            // Swiped Right (Success/Favorite)
            await controls.start({ x: 500, opacity: 0 });
            playSuccess();
            onSwipeRight(data);
        } else if (offset < -100 || velocity < -500) {
            // Swiped Left (Dismiss/Next)
            await controls.start({ x: -500, opacity: 0 });
            onSwipeLeft();
        } else {
            // Reset
            controls.start({ x: 0, opacity: 1 });
        }
    };

    const handleFlip = () => {
        if (!flipped) {
            onReveal(); // Call parent handler
            playPop();
        }
    };

    return (
        <div className="relative w-full max-w-[320px] aspect-[3/4] [perspective:1000px] mx-auto scale-100">
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }} // Elastic drag
                dragElastic={0.7}
                onDragEnd={handleDragEnd}
                style={{ x, rotate, opacity }}
                animate={controls}
                className="w-full h-full relative [transform-style:preserve-3d] cursor-grab active:cursor-grabbing touch-none"
            >
                {/* Swipe Indicators */}
                <motion.div
                    style={{ opacity: likeOpacity }}
                    className="absolute top-8 left-8 z-50 pointer-events-none transform -rotate-12 border-4 border-green-400 rounded-lg px-2 py-1"
                >
                    <span className="text-2xl font-bold text-green-400 uppercase">AMOU</span>
                </motion.div>

                <motion.div
                    style={{ opacity: nopeOpacity }}
                    className="absolute top-8 right-8 z-50 pointer-events-none transform rotate-12 border-4 border-rose-400 rounded-lg px-2 py-1"
                >
                    <span className="text-2xl font-bold text-rose-400 uppercase">PRÓXIMA</span>
                </motion.div>

                {/* Card Content Wrapper to separate Flip logic from Drag logic if needed, 
                    but here we rotate the whole dragged element for 3D flip. 
                */}
                <motion.div
                    className="w-full h-full relative [transform-style:preserve-3d]"
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ duration: 0.4 }}
                    onClick={handleFlip}
                >
                    {/* Front of Card */}
                    <div className="absolute inset-0 [backface-visibility:hidden] bg-gradient-to-br from-brand-primary to-rose-900 rounded-3xl shadow-2xl border-2 border-rose-300/20 flex flex-col items-center justify-center p-6 text-center">
                        <div className="absolute inset-2 border border-white/20 rounded-2xl" />
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm">
                            <Heart className="w-8 h-8 text-rose-200" fill="currentColor" />
                        </div>
                        <h3 className="text-2xl font-serif text-white tracking-wider">Puxa Conversa</h3>
                        <p className="mt-4 text-white/70 text-sm font-medium uppercase tracking-widest">Toque para revelar</p>
                    </div>

                    {/* Back of Card */}
                    <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white rounded-3xl shadow-2xl border flex flex-col items-center justify-between p-8 text-center text-brand-dark">
                        <div className="w-full flex justify-between items-start">
                            <span className="text-xs font-bold uppercase tracking-widest text-brand-primary/60 bg-rose-50 px-3 py-1 rounded-full">
                                {data.category}
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggleFavorite(data); }}
                                className="p-2 -mr-2 -mt-2 hover:bg-rose-50 rounded-full transition-colors z-20"
                                onPointerDown={(e) => e.stopPropagation()} // Prevent drag on button
                            >
                                <Heart
                                    className={cn("w-6 h-6 transition-colors", isFavorite ? "text-brand-primary fill-current" : "text-gray-300")}
                                />
                            </button>
                        </div>

                        <div className="flex-1 flex items-center justify-center select-none">
                            <p className="text-xl md:text-2xl font-serif leading-relaxed text-brand-dark">
                                {data.text}
                            </p>
                        </div>

                        <p className="text-xs text-brand-primary/40 font-medium tracking-wider mt-4">
                            PUXA CONVERSA CASAL
                        </p>
                    </div>
                </motion.div>
            </motion.div>

            {/* Interaction Hint */}
            {!flipped && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-12 left-0 right-0 text-center text-white/50 text-sm"
                >
                    Toque para virar, arraste para passar
                </motion.div>
            )}
        </div>
    );
};

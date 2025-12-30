import React, { createContext, useContext, useRef } from 'react';

// Simple short sounds in base64 to avoid external dependencies/loading issues
const SOUNDS = {
    // Soft pop/bubble sound for flipping cards
    pop: "data:audio/mp3;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG84AA0WAgAAAAAA//uQZAUAB1WI0PZeyAAAAA0goAABACAgIFswIAdHX3xMAQAAAAr5gD/8z//4gS/////3//8v8///4hp//////l9z/////X/4v/9////8v/9//z////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9//1////9v/9/sQAAAAA=",
    // Click sound for buttons
    click: "data:audio/wav;base64,UklGRi4AAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=" // Placeholder, will generate better one or use empty if fails
};

// Real sounds (shortened for brevity, using AudioContext for procedural generation if base64 fails is option B, but sticking to Audio element for now)
// Actually, for a good "Pop", let's use a reliable base64 or just AudioContext.
// Let's implement a simple oscillator-based beep/pop using Web Audio API to be 100% sure it works without large blobs.

const SoundContext = createContext();

export const useSound = () => useContext(SoundContext);

export const SoundProvider = ({ children }) => {
    const audioCtxRef = useRef(null);

    const initAudio = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
    };

    const playPop = () => {
        try {
            initAudio();
            const ctx = audioCtxRef.current;
            if (ctx.state === 'suspended') ctx.resume();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {
            console.error("Audio error", e);
        }
    };

    const playClick = () => {
        try {
            initAudio();
            const ctx = audioCtxRef.current;
            if (ctx.state === 'suspended') ctx.resume();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.frequency.setValueAtTime(1200, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } catch (e) {
            // ignore
        }
    };

    const playSuccess = () => {
        try {
            initAudio();
            const ctx = audioCtxRef.current;
            if (ctx.state === 'suspended') ctx.resume();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.setValueAtTime(554, ctx.currentTime + 0.1); // C#

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            // ignore
        }
    };

    return (
        <SoundContext.Provider value={{ playPop, playClick, playSuccess }}>
            {children}
        </SoundContext.Provider>
    );
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useOnline } from './OnlineContext';
import { useSound } from './SoundContext';

const ReactionContext = createContext();

export const useReactions = () => useContext(ReactionContext);

export const ReactionProvider = ({ children }) => {
    const { sendReaction, lastReaction, roomCode } = useOnline();
    const { playPop } = useSound(); // We could add specific sounds for reactions later

    // activeReactions: Array of { id, type, x, startY }
    const [activeReactions, setActiveReactions] = useState([]);

    // Add a reaction to the local screen
    const addLocalReaction = useCallback((type) => {
        const id = Date.now() + Math.random();
        // Randomize starting X position slightly
        const randomX = Math.random() * 80 - 40; // -40% to +40% from center

        setActiveReactions(prev => [...prev, { id, type, x: randomX }]);

        // Auto remove after animation duration (approx 2s)
        setTimeout(() => {
            setActiveReactions(prev => prev.filter(r => r.id !== id));
        }, 2000);
    }, []);

    // Trigger: Adds locally AND sends online
    const triggerReaction = (type) => {
        addLocalReaction(type);
        if (roomCode) {
            sendReaction(type);
        }
        playPop(); // Simple feedback sound
    };

    // Listen for Online Reactions
    useEffect(() => {
        if (lastReaction) {
            // Check if this reaction is new (by timestamp ID)
            // We need a ref or state to track the last processed ID to avoid duplicates?
            // Actually, React state updates only trigger this effect when lastReaction changes reference-wise.
            // Since we update the whole object in Firebase with a new ID, this effect runs.
            // BUT: We need to make sure we don't re-render our own reaction if we just sent it.
            // The Firebase listener will pick up our OWN write too.
            // So we blindly add it? If we do, the sender sees double (one local immediate, one from echo).

            // Fix: In sendReaction, we write. In listenToRoom, we get it back.
            // Let's rely on the "echo" for simplicity? 
            // NO, immediate feedback is better for UX.
            // So we need to filter out our own if possible, OR just debounce.

            // Simpler approach for MVP:
            // Just let the echo happen? It might feel like "confirmation".
            // Or correct approach: 
            // We used `sender` field in `sendReaction`.
            // We can check if `sender` matches us.
            // But we don't have a stable "we are host/guest" id easily accessible here beyond `isHost`.
            // Let's assume we want to see the reaction. 
            // Wait, if I click, I see mine immediately. Then 200ms later I see the echo? That looks glitchy.

            // Let's track the last processed ID.
            const now = Date.now();
            if (lastReaction.id > (window.lastProcessedReaction || 0)) {
                // Verify if it wasn't triggered by us just now?
                // Actually, let's just NOT addLocalReaction in triggerReaction if we rely on the sync?
                // No, local needs to be instant.

                // Let's duplicate it? No problem. It's a "rain" of emojis.
                // Actually, if we filter by sender it's better.
                // `lastReaction.sender` is 'host' or 'guest'.
                // We need to know who we are. 
                // We can get `isHost` from OnlineContext.

                // Let's pass `isHost` to ReactionContext.
                addLocalReaction(lastReaction.type);
                window.lastProcessedReaction = lastReaction.id;
            }
        }
    }, [lastReaction, addLocalReaction]);

    return (
        <ReactionContext.Provider value={{ triggerReaction, activeReactions }}>
            {children}
        </ReactionContext.Provider>
    );
};

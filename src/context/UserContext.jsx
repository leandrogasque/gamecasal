import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { ref, onValue, set, update } from 'firebase/database';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                // Listen to profile data in DB
                const profileRef = ref(db, `users/${user.uid}`);
                onValue(profileRef, (snapshot) => {
                    const data = snapshot.val();
                    setProfile(data || {
                        nickname: 'Viajante',
                        avatar: '✨',
                        color: 'from-rose-500 to-pink-600',
                        setupComplete: false,
                        stats: {
                            cardsPlayed: 0,
                            likesGiven: 0,
                            sessionsCompleted: 0
                        },
                        favorites: []
                    });
                    setLoading(false);
                });
            } else {
                // Auto sign-in anonymously for now to ensure a UID
                try {
                    await signInAnonymously(auth);
                } catch (error) {
                    console.error("Auth Error", error);
                    setLoading(false);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const updateProfile = async (data) => {
        if (!user) return;
        await update(ref(db, `users/${user.uid}`), {
            ...data,
            lastLogin: Date.now()
        });
    };

    const addGameStats = async (sessionData) => {
        if (!user || !profile) return;

        const currentStats = profile.stats || { cardsPlayed: 0, likesGiven: 0, sessionsCompleted: 0 };
        const newStats = {
            cardsPlayed: currentStats.cardsPlayed + (sessionData.cardsPlayed || 0),
            likesGiven: currentStats.likesGiven + (sessionData.likesGiven || 0),
            sessionsCompleted: currentStats.sessionsCompleted + 1
        };

        // Update stats and merge favorites
        const currentFavorites = profile.favorites || [];
        const newFavorites = [...currentFavorites];

        if (sessionData.favorites) {
            sessionData.favorites.forEach(fav => {
                if (!newFavorites.find(existing => existing.id === fav.id)) {
                    newFavorites.push(fav);
                }
            });
        }

        await update(ref(db, `users/${user.uid}`), {
            stats: newStats,
            favorites: newFavorites
        });
    };

    return (
        <UserContext.Provider value={{ user, profile, updateProfile, addGameStats, loading }}>
            {children}
        </UserContext.Provider>
    );
};

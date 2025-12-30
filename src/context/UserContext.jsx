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
                    setProfile(data);
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
        await set(ref(db, `users/${user.uid}`), {
            ...profile,
            ...data,
            lastLogin: Date.now()
        });
    };

    return (
        <UserContext.Provider value={{ user, profile, updateProfile, loading }}>
            {children}
        </UserContext.Provider>
    );
};

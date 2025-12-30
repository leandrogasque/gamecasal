import React, { createContext, useContext, useState, useEffect } from 'react';
import questionsData from '../data/questions.json';
import { useOnline } from './OnlineContext';
import { useUser } from './UserContext';
import { endContent } from '../data/endContent';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const { onlineState, updateOnlineGame, roomCode, isHost } = useOnline(); // Hook into online data
    const { profile } = useUser();

    const [gameState, setGameState] = useState('home'); // home, lobby, setup, playing, finished
    const [deck, setDeck] = useState([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [isRevealed, setIsRevealed] = useState(false); // New state for card flip
    const [favorites, setFavorites] = useState([]);
    const [gameSettings, setGameSettings] = useState({
        categories: [],
        questionCount: 10,
        randomize: true
    });
    const [playerNames, setPlayerNames] = useState({ 1: 'Jogador 1', 2: 'Jogador 2' });

    // Update P1 name when profile loads
    useEffect(() => {
        if (profile?.nickname && playerNames[1] === 'Jogador 1') {
            setPlayerNames(prev => ({ ...prev, 1: profile.nickname }));
        }
    }, [profile, playerNames]);
    const [endQuoteIndex, setEndQuoteIndex] = useState(0);
    const [endChallengeIndex, setEndChallengeIndex] = useState(0);

    // Analytics
    const [sessionStats, setSessionStats] = useState({ cardsPlayed: 0, likesGiven: 0 });
    const [historyStats, setHistoryStats] = useState({ totalCards: 0, totalLikes: 0 });

    // Load favorites on mount
    useEffect(() => {
        const stored = localStorage.getItem('puxaConversaFavoritos');
        if (stored) {
            setFavorites(JSON.parse(stored));
        }
    }, []);

    // Persist favorites
    useEffect(() => {
        localStorage.setItem('puxaConversaFavoritos', JSON.stringify(favorites));
    }, [favorites]);

    // Load stats on mount
    useEffect(() => {
        const storedStats = localStorage.getItem('puxaConversaStats');
        if (storedStats) {
            setHistoryStats(JSON.parse(storedStats));
        }
    }, []);

    // Persist stats
    useEffect(() => {
        localStorage.setItem('puxaConversaStats', JSON.stringify(historyStats));
    }, [historyStats]);

    // --- ONLINE SYNC LOGIC ---
    useEffect(() => {
        if (roomCode && onlineState) {
            // 1. Sync Game State (Playing/Finished)
            if (onlineState.status && onlineState.status !== gameState) {
                setGameState(onlineState.status);
            }

            // 2. Sync Card Index & Player Turn
            if (onlineState.currentCardIndex !== undefined && onlineState.currentCardIndex !== currentCardIndex) {
                setCurrentCardIndex(onlineState.currentCardIndex);
            }
            if (onlineState.currentPlayer !== undefined && onlineState.currentPlayer !== currentPlayer) {
                setCurrentPlayer(onlineState.currentPlayer);
            }
            if (onlineState.isRevealed !== undefined && onlineState.isRevealed !== isRevealed) {
                setIsRevealed(onlineState.isRevealed);
            }
            if (onlineState.playerNames && JSON.stringify(onlineState.playerNames) !== JSON.stringify(playerNames)) {
                setPlayerNames(onlineState.playerNames);
            }
            if (onlineState.endQuoteIndex !== undefined && onlineState.endQuoteIndex !== endQuoteIndex) {
                setEndQuoteIndex(onlineState.endQuoteIndex);
            }
            if (onlineState.endChallengeIndex !== undefined && onlineState.endChallengeIndex !== endChallengeIndex) {
                setEndChallengeIndex(onlineState.endChallengeIndex);
            }

            // 3. Sync Deck (Guest receives deck from Host)
            if (!isHost && onlineState.deckIDs && deck.length === 0) {
                const newDeck = onlineState.deckIDs.map(id => questionsData.find(q => q.id === id)).filter(Boolean);
                // Simple length check to avoid re-setting identical deck, ideally check IDs
                if (newDeck.length > 0) setDeck(newDeck);
            }
        }
    }, [onlineState, roomCode, isHost, gameState]); // Added necessary deps

    const updateStats = (type) => {
        setSessionStats(prev => ({
            ...prev,
            [type]: prev[type] + 1
        }));
        setHistoryStats(prev => ({
            ...prev,
            [type === 'cardsPlayed' ? 'totalCards' : 'totalLikes']: prev[type === 'cardsPlayed' ? 'totalCards' : 'totalLikes'] + 1
        }));
    };

    const startGame = (settings) => {
        let gameDeck = [];

        // If local or Host, we generate the deck
        setGameSettings(settings);

        let filtered = questionsData.filter(q => settings.categories.includes(q.category));

        if (settings.randomize) {
            filtered = filtered.sort(() => Math.random() - 0.5);
        }

        gameDeck = filtered.slice(0, settings.questionCount);

        setDeck(gameDeck);
        setCurrentCardIndex(0);
        setCurrentPlayer(1);
        setGameState('playing');

        // If Online Host, push initial state AND Deck
        if (roomCode && isHost) {
            updateOnlineGame({
                status: 'playing',
                currentCardIndex: 0,
                currentPlayer: 1,
                isRevealed: false,
                playerNames: playerNames, // Sync initial names
                deckIDs: gameDeck.map(q => q.id) // Send only IDs to save bandwidth
            });
        }
    };

    const nextCard = () => {
        let nextIndex = currentCardIndex + 1;
        let nextPlayer = currentPlayer === 1 ? 2 : 1;
        let nextState = 'playing';

        if (currentCardIndex < deck.length - 1) {
            setCurrentCardIndex(nextIndex);
            setCurrentPlayer(nextPlayer);
            updateStats('cardsPlayed');
        } else {
            setGameState('finished');
            nextState = 'finished';

            // Pick end content indices when finishing
            const qIndex = Math.floor(Math.random() * endContent.quotes.length);
            const cIndex = Math.floor(Math.random() * endContent.challenges.length);
            setEndQuoteIndex(qIndex);
            setEndChallengeIndex(cIndex);

            // Sync if Online
            if (roomCode && isHost) {
                updateOnlineGame({
                    status: 'finished',
                    currentCardIndex: nextIndex,
                    currentPlayer: nextPlayer,
                    isRevealed: false,
                    endQuoteIndex: qIndex,
                    endChallengeIndex: cIndex
                });
                return; // Prevent second update call below
            }
        }

        // Reset reveal state locally
        setIsRevealed(false);

        // Sync Online
        if (roomCode) {
            updateOnlineGame({
                currentCardIndex: nextIndex,
                currentPlayer: nextPlayer,
                isRevealed: false,
                status: nextState // Send 'finished' status
            });
        }
    };

    const toggleFavorite = (card) => {
        const isAdding = !favorites.find(f => f.id === card.id);
        if (isAdding) updateStats('likesGiven');

        setFavorites(prev => {
            if (prev.find(f => f.id === card.id)) {
                return prev.filter(f => f.id !== card.id);
            }
            return [...prev, card];
        });
    };

    const resetGame = () => {
        setGameState('home');
        setDeck([]);
        setIsRevealed(false);
        if (roomCode) {
            // If exiting completely, maybe leave room? 
            // For key 'Início', simpler to just go home locally. 
            // But if online, maybe should inform others?
        }
    };

    const restartGame = () => {
        // Go back to setup, keeping connection
        setGameState('setup');
        if (roomCode && isHost) {
            updateOnlineGame({
                status: 'setup',
                currentCardIndex: 0,
                deckIDs: null // Clear deck
            });
        }
    };

    const revealCard = () => {
        setIsRevealed(true);
        if (roomCode) {
            updateOnlineGame({ isRevealed: true });
        }
    };

    const refreshChallenge = () => {
        const nextIdx = Math.floor(Math.random() * endContent.challenges.length);
        setEndChallengeIndex(nextIdx);
        if (roomCode && isHost) {
            updateOnlineGame({ endChallengeIndex: nextIdx });
        }
    };

    return (
        <GameContext.Provider value={{
            gameState,
            setGameState,
            deck,
            currentCardIndex,
            currentPlayer,
            favorites,
            toggleFavorite,
            startGame,
            nextCard,
            resetGame,
            isRevealed,
            revealCard,
            currentCard: deck[currentCardIndex],
            playerNames,
            setPlayerNames,
            sessionStats,
            historyStats,
            restartGame,
            isHost, // Expose isHost
            roomCode, // Expose roomCode
            endQuoteIndex,
            endChallengeIndex,
            refreshChallenge
        }}>
            {children}
        </GameContext.Provider>
    );
};

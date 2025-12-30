import React, { createContext, useContext, useState, useEffect } from 'react';
import questionsData from '../data/questions.json';
import { useOnline } from './OnlineContext';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const { onlineState, updateOnlineGame, roomCode, isHost } = useOnline(); // Hook into online data

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
            if (onlineState.currentCardIndex !== undefined) setCurrentCardIndex(onlineState.currentCardIndex);
            if (onlineState.currentPlayer !== undefined) setCurrentPlayer(onlineState.currentPlayer);
            if (onlineState.isRevealed !== undefined) setIsRevealed(onlineState.isRevealed);
            if (onlineState.playerNames !== undefined) setPlayerNames(onlineState.playerNames);

            // 3. Sync Deck (Guest receives deck from Host)
            // If we are guest (not host) and we receive a deckIDs array, reconstruct the deck
            if (!isHost && onlineState.deckIDs && deck.length === 0) {
                const newDeck = onlineState.deckIDs.map(id => questionsData.find(q => q.id === id)).filter(Boolean);
                setDeck(newDeck);
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
        }

        // Reset reveal state locally
        setIsRevealed(false);

        // Sync Online
        if (roomCode) {
            updateOnlineGame({
                currentCardIndex: nextIndex,
                currentPlayer: nextPlayer,
                isRevealed: false
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
    };

    const revealCard = () => {
        setIsRevealed(true);
        if (roomCode) {
            updateOnlineGame({ isRevealed: true });
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
            historyStats
        }}>
            {children}
        </GameContext.Provider>
    );
};

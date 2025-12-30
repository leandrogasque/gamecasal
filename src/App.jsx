import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Layout } from './components/Layout';
import { HomeScreen } from './screens/HomeScreen';
import { SetupScreen } from './screens/SetupScreen';
import { GameScreen } from './screens/GameScreen';
import { EndScreen } from './screens/EndScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { JourneyScreen } from './screens/JourneyScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { useUser } from './context/UserContext';

function AppContent() {
    const { gameState } = useGame();
    const { profile, loading } = useUser();

    // While loading auth/profile, show blank or splash
    if (loading) return null;

    // Force profile setup if not completed
    if (!profile?.setupComplete) {
        return <Layout><ProfileScreen /></Layout>;
    }

    return (
        <Layout>
            {gameState === 'home' && <HomeScreen />}
            {gameState === 'lobby' && <LobbyScreen />}
            {gameState === 'setup' && <SetupScreen />}
            {gameState === 'playing' && <GameScreen />}
            {gameState === 'finished' && <EndScreen />}
            {gameState === 'journey' && <JourneyScreen />}
        </Layout>
    );
}

function App() {
    return <AppContent />;
}

export default App;

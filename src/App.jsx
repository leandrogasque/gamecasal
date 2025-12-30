import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Layout } from './components/Layout';
import { HomeScreen } from './screens/HomeScreen';
import { SetupScreen } from './screens/SetupScreen';
import { GameScreen } from './screens/GameScreen';
import { EndScreen } from './screens/EndScreen';
import { LobbyScreen } from './screens/LobbyScreen';

function AppContent() {
    const { gameState } = useGame();

    return (
        <Layout>
            {gameState === 'home' && <HomeScreen />}
            {gameState === 'lobby' && <LobbyScreen />}
            {gameState === 'setup' && <SetupScreen />}
            {gameState === 'playing' && <GameScreen />}
            {gameState === 'finished' && <EndScreen />}
        </Layout>
    );
}

function App() {
    return <AppContent />;
}

export default App;

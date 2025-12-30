import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { GameProvider } from './context/GameContext'
import { SoundProvider } from './context/SoundContext'
import { OnlineProvider } from './context/OnlineContext'
import { ReactionProvider } from './context/ReactionContext'
import './index.css'

import { ErrorBoundary } from './components/ErrorBoundary'

import { UserProvider } from './context/UserContext'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <UserProvider>
                <OnlineProvider>
                    <GameProvider>
                        <SoundProvider>
                            <ReactionProvider>
                                <App />
                            </ReactionProvider>
                        </SoundProvider>
                    </GameProvider>
                </OnlineProvider>
            </UserProvider>
        </ErrorBoundary>
    </React.StrictMode>,
)

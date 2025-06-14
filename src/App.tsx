'use client';

import { useRef, useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { signOut } from 'aws-amplify/auth';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
import AuthComponent from './components/AuthComponent';
import GameOverModal from './components/GameOverModal';
import Scoreboard from './components/Scoreboard';
import { EventBus } from './game/EventBus';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);

function App() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    
    // Authentication state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showAuth, setShowAuth] = useState(true);
    const [isSigningOut, setIsSigningOut] = useState(false);
    
    // Game state
    const [gameOverData, setGameOverData] = useState<any>(null);
    const [showGameOver, setShowGameOver] = useState(false);
    const [showScoreboard, setShowScoreboard] = useState(false);

    useEffect(() => {
        // Listen for game over events from Tetris
        EventBus.on('game-over', (data: any) => {
            setGameOverData(data);
            setShowGameOver(true);
        });

        return () => {
            EventBus.removeListener('game-over');
        };
    }, []);

    const handleAuthStateChange = (authenticated: boolean, user: any) => {
        setIsAuthenticated(authenticated);
        setCurrentUser(user);
        setShowAuth(false);
    };

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            // Actually sign out from AWS Amplify
            await signOut();
            
            // Update local state
            setIsAuthenticated(false);
            setCurrentUser(null);
            setShowAuth(true);
            setShowGameOver(false);
            setShowScoreboard(false);
        } catch (error) {
            console.error('Error signing out:', error);
            // Still update local state even if sign out fails
            setIsAuthenticated(false);
            setCurrentUser(null);
            setShowAuth(true);
            setShowGameOver(false);
            setShowScoreboard(false);
        } finally {
            setIsSigningOut(false);
        }
    };

    const handleGameRestart = () => {
        // Restart the Tetris game
        if (phaserRef.current?.scene) {
            const scene = phaserRef.current.scene;
            if (scene.scene.key === 'TetrisGame') {
                scene.scene.restart();
            } else {
                scene.scene.start('TetrisGame');
            }
        }
    };

    const currentScene = (scene: Phaser.Scene) => {
        // Scene change handler - can be used for future features
    };

    // Show authentication screen first
    if (showAuth) {
        return <AuthComponent onAuthStateChange={handleAuthStateChange} />;
    }

    // Show game interface after authentication
    return (
        <div id="app">
            {/* User Status Bar */}
            <div className="user-status-bar">
                <div className="user-info">
                    <span>Welcome, {currentUser?.username || 'Guest'}!</span>
                    {isAuthenticated && (
                        <span className="auth-badge">Authenticated</span>
                    )}
                </div>
                <div className="user-actions">
                    <button 
                        className="status-button"
                        onClick={() => setShowScoreboard(true)}
                    >
                        🏆 Scoreboard
                    </button>
                    <button 
                        className="status-button signout"
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                    >
                        {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                    </button>
                </div>
            </div>

            {/* Game Container */}
            <div id="game-container">
                <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            </div>

            {/* Game Over Modal */}
            <GameOverModal
                isVisible={showGameOver}
                score={gameOverData?.score || 0}
                level={gameOverData?.level || 1}
                lines={gameOverData?.lines || 0}
                currentUser={currentUser}
                onRestart={handleGameRestart}
                onClose={() => setShowGameOver(false)}
                onShowScoreboard={() => {
                    setShowGameOver(false);
                    setShowScoreboard(true);
                }}
            />

            {/* Scoreboard Modal */}
            <Scoreboard
                isVisible={showScoreboard}
                onClose={() => setShowScoreboard(false)}
                currentUser={currentUser}
            />

            <style jsx>{`
                #app {
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                    color: white;
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                }

                .user-status-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 30px;
                    background: rgba(0, 0, 0, 0.4);
                    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    flex-shrink: 0;
                    height: 60px;
                    box-sizing: border-box;
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    font-size: 16px;
                    font-weight: 500;
                }

                .auth-badge {
                    background: linear-gradient(45deg, #27ae60, #2ecc71);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: bold;
                    text-transform: uppercase;
                }

                .user-actions {
                    display: flex;
                    gap: 10px;
                }

                .status-button {
                    padding: 8px 16px;
                    background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: bold;
                    transition: all 0.3s ease;
                }

                .status-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                }

                .status-button.signout {
                    background: linear-gradient(45deg, #e74c3c, #c0392b);
                }

                .status-button.signout:hover {
                    box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
                }

                .status-button:disabled {
                    background: #666 !important;
                    cursor: not-allowed !important;
                    transform: none !important;
                    box-shadow: none !important;
                }

                #game-container {
                    flex: 1;
                    width: 100vw;
                    height: calc(100vh - 60px);
                    position: relative;
                    overflow: hidden;
                }

                @media (max-width: 768px) {
                    .user-status-bar {
                        flex-direction: column;
                        gap: 10px;
                        padding: 10px 15px;
                        height: auto;
                    }

                    .user-actions {
                        width: 100%;
                        justify-content: center;
                    }

                    #game-container {
                        height: calc(100vh - 80px);
                    }
                }

                @media (max-width: 480px) {
                    .user-status-bar {
                        padding: 8px 10px;
                    }
                    
                    .user-info {
                        font-size: 14px;
                    }
                    
                    .status-button {
                        padding: 6px 12px;
                        font-size: 12px;
                    }

                    #game-container {
                        height: calc(100vh - 100px);
                    }
                }

                /* Global game canvas styling */
                :global(canvas) {
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    border-radius: 0;
                    box-shadow: none;
                }
            `}</style>
        </div>
    );
}

export default App;

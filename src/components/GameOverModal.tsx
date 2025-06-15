'use client';

import { useState, useEffect } from 'react';
import { ScoreService, GameScore } from '../services/scoreService';
import { getUserDisplayInfo } from '../utils/userUtils';

interface GameOverModalProps {
  isVisible: boolean;
  score: number;
  level: number;
  lines: number;
  currentUser: any;
  onRestart: () => void;
  onClose: () => void;
  onShowScoreboard: () => void;
}

export default function GameOverModal({
  isVisible,
  score,
  level,
  lines,
  currentUser,
  onRestart,
  onClose,
  onShowScoreboard
}: GameOverModalProps) {
  const [playerName, setPlayerName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [isHighScore, setIsHighScore] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (isVisible) {
      // Reset state when modal opens
      setScoreSaved(false);
      setSaveError('');
      setIsSaving(false);
      
      // Pre-populate player name with user's display name
      const initializePlayerName = async () => {
        if (currentUser) {
          try {
            const displayInfo = await getUserDisplayInfo(currentUser);
            setPlayerName(displayInfo.displayName);
          } catch (error) {
            console.log('Could not get display name:', error);
            setPlayerName(currentUser.username === 'Guest' ? 'Guest Player' : 'Player');
          }
        } else {
          setPlayerName('Guest Player');
        }
      };
      
      initializePlayerName();

      // Check if this is a high score
      checkHighScore();
    }
  }, [isVisible, currentUser]);

  const checkHighScore = async () => {
    try {
      const isHigh = await ScoreService.isHighScore(score);
      setIsHighScore(isHigh);
    } catch (error) {
      console.error('Error checking high score:', error);
    }
  };

  const handleSaveScore = async () => {
    if (!playerName.trim()) {
      setSaveError('Please enter a player name');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    const gameScore: GameScore = {
      playerName: playerName.trim(),
      score,
      level,
      linesCleared: lines,
      userId: currentUser?.username || undefined
    };

    try {
      const success = await ScoreService.saveScore(gameScore, currentUser);
      
      if (success) {
        setScoreSaved(true);
      } else {
        setSaveError('Failed to save score. Please try again.');
      }
    } catch (error) {
      setSaveError('An error occurred while saving your score.');
      console.error('Save score error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestart = () => {
    onRestart();
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="game-over-overlay">
      <div className="game-over-modal">
        <div className="game-over-header">
          <h2>🎮 Game Over!</h2>
          {isHighScore && (
            <div className="high-score-badge">
              🏆 High Score!
            </div>
          )}
        </div>

        <div className="game-stats">
          <div className="stat-item">
            <span className="stat-label">Final Score</span>
            <span className="stat-value score">{score.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Level Reached</span>
            <span className="stat-value">{level}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Lines Cleared</span>
            <span className="stat-value">{lines}</span>
          </div>
        </div>

        {!scoreSaved ? (
          <div className="save-score-section">
            <h3>Save Your Score</h3>
            <div className="player-name-input">
              <label htmlFor="playerName">Player Name:</label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                disabled={isSaving}
              />
            </div>
            
            {saveError && (
              <div className="error-message">{saveError}</div>
            )}

            <button
              onClick={handleSaveScore}
              disabled={isSaving || !playerName.trim()}
              className="save-button"
            >
              {isSaving ? 'Saving...' : 'Save Score'}
            </button>
          </div>
        ) : (
          <div className="score-saved-section">
            <div className="success-message">
              ✅ Score saved successfully!
            </div>
            <p>Your score has been added to the leaderboard.</p>
          </div>
        )}

        <div className="action-buttons">
          <button onClick={handleRestart} className="restart-button">
            🔄 Play Again
          </button>
          <button onClick={onShowScoreboard} className="scoreboard-button">
            🏆 View Scoreboard
          </button>
          <button onClick={onClose} className="close-button">
            ❌ Close
          </button>
        </div>
      </div>

      <style jsx>{`
        .game-over-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1500;
          padding: 20px;
        }

        .game-over-modal {
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          border-radius: 16px;
          padding: 30px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .game-over-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .game-over-header h2 {
          color: #e74c3c;
          font-size: 36px;
          margin: 0 0 15px 0;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        .high-score-badge {
          background: linear-gradient(45deg, #f39c12, #e67e22);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 16px;
          font-weight: bold;
          display: inline-block;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .game-stats {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-item:last-child {
          margin-bottom: 0;
          border-bottom: none;
        }

        .stat-label {
          color: #bdc3c7;
          font-size: 16px;
        }

        .stat-value {
          color: white;
          font-size: 20px;
          font-weight: bold;
        }

        .stat-value.score {
          color: #f39c12;
          font-size: 24px;
        }

        .save-score-section {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
        }

        .save-score-section h3 {
          color: white;
          margin: 0 0 20px 0;
          text-align: center;
          font-size: 20px;
        }

        .player-name-input {
          margin-bottom: 20px;
        }

        .player-name-input label {
          display: block;
          color: #bdc3c7;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .player-name-input input {
          width: 100%;
          padding: 12px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 16px;
          transition: border-color 0.3s;
        }

        .player-name-input input:focus {
          outline: none;
          border-color: #3498db;
        }

        .player-name-input input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .save-button {
          width: 100%;
          padding: 12px;
          background: linear-gradient(45deg, #27ae60, #2ecc71);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }

        .save-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4);
        }

        .save-button:disabled {
          background: #7f8c8d;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .score-saved-section {
          background: rgba(46, 204, 113, 0.2);
          border: 2px solid #2ecc71;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
          text-align: center;
        }

        .success-message {
          color: #2ecc71;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .score-saved-section p {
          color: #bdc3c7;
          margin: 0;
        }

        .action-buttons {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .action-buttons button {
          flex: 1;
          min-width: 120px;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }

        .restart-button {
          background: linear-gradient(45deg, #3498db, #2980b9);
          color: white;
        }

        .restart-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4);
        }

        .scoreboard-button {
          background: linear-gradient(45deg, #9b59b6, #8e44ad);
          color: white;
        }

        .scoreboard-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(155, 89, 182, 0.4);
        }

        .close-button {
          background: linear-gradient(45deg, #95a5a6, #7f8c8d);
          color: white;
        }

        .close-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(149, 165, 166, 0.4);
        }

        .error-message {
          background: rgba(231, 76, 60, 0.2);
          border: 1px solid #e74c3c;
          color: #e74c3c;
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 15px;
          font-size: 14px;
          text-align: center;
        }

        @media (max-width: 600px) {
          .game-over-modal {
            padding: 20px;
            margin: 10px;
          }

          .action-buttons {
            flex-direction: column;
          }

          .action-buttons button {
            min-width: auto;
          }

          .game-over-header h2 {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
}

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
  lastServiceFact: any;
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
  lastServiceFact,
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
    setIsSaving(true);
    setSaveError('');

    // Use the pre-populated display name from user account
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

        {/* AWS Service Fact Section */}
        {lastServiceFact && (
          <div className="aws-service-fact">
            <div className="fact-header">
              <span className="service-icon">{lastServiceFact.icon}</span>
              <div className="service-info">
                <h3>{lastServiceFact.service}</h3>
                <span className="service-category">{lastServiceFact.category} • Since {lastServiceFact.launchYear}</span>
              </div>
            </div>
            <div className="fact-content">
              <h4>💡 Did you know?</h4>
              <p>{lastServiceFact.fact}</p>
            </div>
          </div>
        )}

        {!scoreSaved ? (
          <div className="save-score-section">
            
            {saveError && (
              <div className="error-message">{saveError}</div>
            )}

            <button
              onClick={handleSaveScore}
              disabled={isSaving}
              className="save-button"
            >
              {isSaving ? 'Saving...' : 'Save Score to Leaderboard'}
            </button>
          </div>
        ) : (
          <div className="score-saved-section">
            <div className="success-message">
              ✅ Score saved successfully!
            </div>
            <p>Your score has been added to the leaderboard as <strong>{playerName}</strong>.</p>
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
          align-items: flex-start;
          z-index: 1500;
          padding: 15px;
          overflow-y: auto;
        }

        .game-over-modal {
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          border-radius: 16px;
          padding: 25px;
          width: 100%;
          max-width: 650px;
          max-height: 90vh;
          overflow-y: auto;
          margin: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .game-over-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .game-over-header h2 {
          color: #e74c3c;
          font-size: 30px;
          margin: 0 0 10px 0;
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
          padding: 25px;
          margin-bottom: 30px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        }

        .stat-item:last-child {
          margin-bottom: 0;
          border-bottom: none;
        }

        .stat-label {
          color: #bdc3c7;
          font-size: 14px;
          margin-bottom: 8px;
          font-weight: 500;
        }
          font-size: 16px;
        }

        .stat-value {
          color: white;
          font-size: 24px;
          font-weight: bold;
        }

        .stat-value.score {
          color: #f39c12;
          font-size: 28px;
        }

        .aws-service-fact {
          background: linear-gradient(135deg, rgba(255, 153, 0, 0.1), rgba(255, 153, 0, 0.05));
          border: 2px solid rgba(255, 153, 0, 0.3);
          border-radius: 12px;
          padding: 25px;
          margin: 25px 0;
          animation: factSlideIn 0.5s ease-out;
        }

        @keyframes factSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fact-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          gap: 20px;
        }

        .service-icon {
          font-size: 36px;
          background: rgba(255, 255, 255, 0.1);
          padding: 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 60px;
          height: 60px;
          flex-shrink: 0;
        }

        .service-info {
          flex: 1;
        }

        .service-info h3 {
          color: #FF9900;
          margin: 0 0 8px 0;
          font-size: 22px;
          font-weight: bold;
        }

        .service-category {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          font-style: italic;
        }

        .fact-content {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          padding: 20px;
        }

        .fact-content h4 {
          color: #3498db;
          margin: 0 0 15px 0;
          font-size: 18px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .fact-content p {
          color: #ecf0f1;
          line-height: 1.7;
          margin: 0;
          font-size: 15px;
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

        .player-name-display {
          margin-bottom: 20px;
          text-align: center;
        }

        .player-name-display label {
          display: block;
          color: #bdc3c7;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .player-name-value {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 12px;
          color: #3498db;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .player-name-note {
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
          font-style: italic;
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
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 15px;
          margin-top: 30px;
        }

        .action-buttons button {
          min-width: 180px;
          padding: 14px 24px;
          border: none;
          border-radius: 8px;
          font-size: 15px;
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

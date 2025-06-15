import React, { useState, useEffect } from 'react';
import { ScoreService } from '../services/scoreService';
import { GameScore } from '../types/GameScore';
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
  const [saveError, setSaveError] = useState('');
  const [isHighScore, setIsHighScore] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Reset states when modal opens
      setScoreSaved(false);
      setSaveError('');
      setIsSaving(false);
      
      // Set player name from current user
      if (currentUser?.attributes?.['custom:display_name']) {
        setPlayerName(currentUser.attributes['custom:display_name']);
      } else if (currentUser?.username) {
        setPlayerName(currentUser.username);
      } else {
        setPlayerName('Anonymous Player');
      }

      // Check if this is a high score
      checkHighScore();
    }
  }, [isVisible, currentUser, score]);

  const checkHighScore = async () => {
    try {
      const scores = await ScoreService.getTopScores(10);
      if (scores.length === 0 || score > Math.max(...scores.map(s => s.score))) {
        setIsHighScore(true);
      }
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
  };

  if (!isVisible) return null;

  return (
    <div className="game-over-overlay">
      <div className="game-over-modal">
        <div className="game-over-header">
          <h2>🎮 Game Over!</h2>
          {isHighScore && (
            <div className="high-score-badge">🏆 NEW HIGH SCORE! 🏆</div>
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
              <div className="service-icon">
                <img 
                  src={lastServiceFact.iconPath} 
                  alt={lastServiceFact.service}
                  className="aws-service-svg"
                />
              </div>
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
          background: rgba(255, 255, 255, 0.1);
          padding: 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 60px;
          height: 60px;
          flex-shrink: 0;
          border: 2px solid rgba(255, 153, 0, 0.3);
        }

        .aws-service-svg {
          width: 36px;
          height: 36px;
          filter: brightness(0) saturate(100%) invert(60%) sepia(98%) saturate(1352%) hue-rotate(15deg) brightness(101%) contrast(101%);
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
          margin-bottom: 25px;
        }

        .save-score-section h3 {
          color: #3498db;
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
          padding: 14px;
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
          background: linear-gradient(45deg, #2ecc71, #27ae60);
          transform: translateY(-2px);
        }

        .save-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .score-saved-section {
          text-align: center;
          margin-bottom: 25px;
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

        .error-message {
          color: #e74c3c;
          background: rgba(231, 76, 60, 0.1);
          border: 1px solid rgba(231, 76, 60, 0.3);
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 15px;
          text-align: center;
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
          background: linear-gradient(45deg, #2980b9, #3498db);
          transform: translateY(-2px);
        }

        .scoreboard-button {
          background: linear-gradient(45deg, #f39c12, #e67e22);
          color: white;
        }

        .scoreboard-button:hover {
          background: linear-gradient(45deg, #e67e22, #f39c12);
          transform: translateY(-2px);
        }

        .close-button {
          background: linear-gradient(45deg, #95a5a6, #7f8c8d);
          color: white;
        }

        .close-button:hover {
          background: linear-gradient(45deg, #7f8c8d, #95a5a6);
          transform: translateY(-2px);
        }

        @media (max-width: 600px) {
          .game-over-modal {
            padding: 20px;
            margin: 10px;
          }

          .game-over-header h2 {
            font-size: 28px;
          }

          .aws-service-svg {
            width: 32px;
            height: 32px;
          }

          .service-icon {
            min-width: 50px;
            height: 50px;
          }
        }
      `}</style>
    </div>
  );
}

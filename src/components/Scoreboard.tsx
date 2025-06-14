'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

interface ScoreboardProps {
  isVisible: boolean;
  onClose: () => void;
  currentUser: any;
}

interface ScoreEntry {
  id: string;
  playerName: string;
  score: number;
  level: number;
  linesCleared: number;
  gameDate: string;
  userId?: string;
}

export default function Scoreboard({ isVisible, onClose, currentUser }: ScoreboardProps) {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'personal'>('all');

  useEffect(() => {
    if (isVisible) {
      fetchScores();
    }
  }, [isVisible, filter]);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const { data } = await client.models.Score.list();
      
      let filteredScores = data || [];
      
      if (filter === 'personal' && currentUser?.username) {
        filteredScores = filteredScores.filter(score => 
          score.userId === currentUser.username || 
          score.playerName === currentUser.username
        );
      }
      
      // Sort by score descending
      const sortedScores = filteredScores
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 50); // Top 50 scores
      
      setScores(sortedScores.map(score => ({
        id: score.id || '',
        playerName: score.playerName || 'Anonymous',
        score: score.score || 0,
        level: score.level || 1,
        linesCleared: score.linesCleared || 0,
        gameDate: score.gameDate || new Date().toISOString(),
        userId: score.userId || undefined
      })));
    } catch (error) {
      console.error('Error fetching scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown';
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="scoreboard-overlay">
      <div className="scoreboard-modal">
        <div className="scoreboard-header">
          <h2>🏆 High Scores</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="filter-controls">
          <button
            onClick={() => setFilter('all')}
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          >
            All Players
          </button>
          {currentUser && (
            <button
              onClick={() => setFilter('personal')}
              className={`filter-button ${filter === 'personal' ? 'active' : ''}`}
            >
              My Scores
            </button>
          )}
        </div>

        <div className="scoreboard-content">
          {loading ? (
            <div className="loading">Loading scores...</div>
          ) : scores.length === 0 ? (
            <div className="no-scores">
              {filter === 'personal' ? 'No personal scores yet!' : 'No scores recorded yet!'}
              <p>Play some games to see scores here.</p>
            </div>
          ) : (
            <div className="scores-list">
              <div className="scores-header">
                <span className="rank-col">Rank</span>
                <span className="player-col">Player</span>
                <span className="score-col">Score</span>
                <span className="level-col">Level</span>
                <span className="lines-col">Lines</span>
                <span className="date-col">Date</span>
              </div>
              
              {scores.map((score, index) => (
                <div 
                  key={score.id} 
                  className={`score-row ${
                    currentUser && (score.userId === currentUser.username || 
                    score.playerName === currentUser.username) ? 'personal-score' : ''
                  }`}
                >
                  <span className="rank-col rank">
                    {getRankIcon(index)}
                  </span>
                  <span className="player-col">
                    {score.playerName}
                    {currentUser && (score.userId === currentUser.username || 
                     score.playerName === currentUser.username) && (
                      <span className="you-indicator"> (You)</span>
                    )}
                  </span>
                  <span className="score-col score-value">
                    {score.score.toLocaleString()}
                  </span>
                  <span className="level-col">{score.level}</span>
                  <span className="lines-col">{score.linesCleared}</span>
                  <span className="date-col">{formatDate(score.gameDate)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="scoreboard-footer">
          <button onClick={onClose} className="close-footer-button">
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        .scoreboard-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          padding: 20px;
        }

        .scoreboard-modal {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          border-radius: 12px;
          width: 100%;
          max-width: 900px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .scoreboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 30px;
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
        }

        .scoreboard-header h2 {
          color: white;
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }

        .close-button {
          background: none;
          border: none;
          color: white;
          font-size: 32px;
          cursor: pointer;
          padding: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.3s;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .filter-controls {
          display: flex;
          gap: 10px;
          padding: 20px 30px 0;
        }

        .filter-button {
          padding: 8px 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          background: transparent;
          color: white;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
        }

        .filter-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .filter-button.active {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.6);
        }

        .scoreboard-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px 30px;
        }

        .loading, .no-scores {
          text-align: center;
          color: white;
          padding: 40px;
          font-size: 18px;
        }

        .no-scores p {
          margin-top: 10px;
          opacity: 0.8;
          font-size: 14px;
        }

        .scores-list {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }

        .scores-header {
          display: grid;
          grid-template-columns: 80px 1fr 100px 60px 60px 120px;
          gap: 15px;
          padding: 15px 20px;
          background: rgba(0, 0, 0, 0.3);
          color: white;
          font-weight: bold;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .score-row {
          display: grid;
          grid-template-columns: 80px 1fr 100px 60px 60px 120px;
          gap: 15px;
          padding: 15px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          transition: background-color 0.3s;
        }

        .score-row:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .score-row.personal-score {
          background: rgba(255, 215, 0, 0.2);
          border-left: 4px solid #FFD700;
        }

        .score-row:last-child {
          border-bottom: none;
        }

        .rank {
          font-weight: bold;
          font-size: 16px;
        }

        .score-value {
          font-weight: bold;
          color: #FFD700;
        }

        .you-indicator {
          color: #FFD700;
          font-size: 12px;
          font-weight: bold;
        }

        .rank-col, .level-col, .lines-col {
          text-align: center;
        }

        .score-col {
          text-align: right;
        }

        .date-col {
          font-size: 12px;
          opacity: 0.8;
        }

        .scoreboard-footer {
          padding: 20px 30px;
          border-top: 2px solid rgba(255, 255, 255, 0.2);
          text-align: center;
        }

        .close-footer-button {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 10px 30px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s;
        }

        .close-footer-button:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
        }

        @media (max-width: 768px) {
          .scoreboard-modal {
            margin: 10px;
            max-height: 90vh;
          }

          .scores-header, .score-row {
            grid-template-columns: 60px 1fr 80px 50px 50px 100px;
            gap: 10px;
            padding: 12px 15px;
            font-size: 12px;
          }

          .scoreboard-header, .scoreboard-content, .scoreboard-footer {
            padding-left: 20px;
            padding-right: 20px;
          }

          .date-col {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}

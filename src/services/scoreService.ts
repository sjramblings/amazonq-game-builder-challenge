import { generateClient } from 'aws-amplify/data';
import { getUserDisplayInfo } from '../utils/userUtils';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export interface GameScore {
  playerName: string;
  score: number;
  level: number;
  linesCleared: number;
  userId?: string;
}

export class ScoreService {
  static async saveScore(gameScore: GameScore, currentUser?: any): Promise<boolean> {
    try {
      // Get the display name for the current user
      let playerName = gameScore.playerName;
      if (currentUser) {
        try {
          const displayInfo = await getUserDisplayInfo(currentUser);
          playerName = displayInfo.displayName;
        } catch (error) {
          console.log('Could not get display name, using provided name:', error);
        }
      }

      const scoreData = {
        playerName: playerName,
        score: gameScore.score,
        level: gameScore.level,
        linesCleared: gameScore.linesCleared,
        gameDate: new Date().toISOString(),
        userId: gameScore.userId || null,
      };

      console.log('Attempting to save score:', scoreData);

      const { data, errors } = await client.models.Score.create(scoreData);
      
      if (errors && errors.length > 0) {
        console.error('GraphQL errors saving score:', errors);
        return false;
      }

      console.log('Score saved successfully:', data);
      return true;
    } catch (error) {
      console.error('Failed to save score:', error);
      
      // Try alternative approach with minimal data
      try {
        console.log('Trying fallback save approach...');
        const fallbackData = {
          playerName: gameScore.playerName, // Use original name as fallback
          score: gameScore.score,
          level: gameScore.level,
          linesCleared: gameScore.linesCleared,
          gameDate: new Date().toISOString(),
        };
        
        const { data: fallbackResult, errors: fallbackErrors } = await client.models.Score.create(fallbackData);
        
        if (fallbackErrors && fallbackErrors.length > 0) {
          console.error('Fallback save also failed:', fallbackErrors);
          return false;
        }
        
        console.log('Fallback save successful:', fallbackResult);
        return true;
      } catch (fallbackError) {
        console.error('Both save attempts failed:', fallbackError);
        return false;
      }
    }
  }

  static async getTopScores(limit: number = 10) {
    try {
      const { data, errors } = await client.models.Score.list();
      
      if (errors && errors.length > 0) {
        console.error('Error fetching scores:', errors);
        return [];
      }

      // Sort by score descending and limit results
      return (data || [])
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch scores:', error);
      return [];
    }
  }

  static async getUserScores(userId: string, limit: number = 10) {
    try {
      const { data, errors } = await client.models.Score.list();
      
      if (errors && errors.length > 0) {
        console.error('Error fetching user scores:', errors);
        return [];
      }

      // Filter by user and sort by score descending
      return (data || [])
        .filter(score => score.userId === userId)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch user scores:', error);
      return [];
    }
  }

  static async isHighScore(score: number): Promise<boolean> {
    try {
      const topScores = await this.getTopScores(10);
      
      // If we have less than 10 scores, it's automatically a high score
      if (topScores.length < 10) {
        return true;
      }

      // Check if the score is higher than the lowest top 10 score
      const lowestTopScore = topScores[topScores.length - 1];
      return score > (lowestTopScore.score || 0);
    } catch (error) {
      console.error('Failed to check if high score:', error);
      return false;
    }
  }

  static formatScore(score: number): string {
    return score.toLocaleString();
  }

  static calculateScoreRank(score: number, allScores: any[]): number {
    const sortedScores = allScores
      .map(s => s.score || 0)
      .sort((a, b) => b - a);
    
    const rank = sortedScores.findIndex(s => s <= score) + 1;
    return rank || sortedScores.length + 1;
  }
}

# Tetris Game with AWS Amplify Integration

This project features a fully functional Tetris game built with Phaser 3, Next.js, and AWS Amplify for authentication and score tracking.

## Features

### 🎮 Tetris Game
- **Complete Tetris gameplay** with all classic pieces (I, O, T, S, Z, J, L)
- **Smooth controls**: Arrow keys for movement, rotation, and soft drop
- **Hard drop**: Space bar for instant piece placement
- **Line clearing** with proper scoring system
- **Level progression** with increasing speed
- **Next piece preview**
- **Pause functionality** (P key)
- **Game over detection** and restart (R key)

### 🔐 Authentication
- **AWS Cognito integration** for user authentication
- **Sign up/Sign in** with email verification
- **Guest mode** for playing without registration
- **Secure user session management**

### 🏆 Scoreboard System
- **Real-time score tracking** using AWS DynamoDB
- **Personal and global leaderboards**
- **High score detection** and celebration
- **Score persistence** across sessions
- **Player name customization**

### 📊 Score Data Model
Each score entry includes:
- Player name
- Final score
- Level reached
- Lines cleared
- Game date/time
- User ID (for authenticated users)

## Game Controls

### Tetris Controls
- **← →** Move piece left/right
- **↓** Soft drop (faster fall)
- **↑** Rotate piece
- **Space** Hard drop (instant placement)
- **P** Pause/Resume game
- **R** Restart game (when game over)

### UI Controls
- **🏠 Main Menu** - Return to game selection
- **🧩 Play Tetris** - Start Tetris game
- **🏆 Scoreboard** - View high scores

## Technical Architecture

### Frontend
- **Phaser 3** - Game engine for Tetris gameplay
- **Next.js 15** - React framework with SSR support
- **TypeScript** - Type-safe development
- **React Components** - UI for authentication and scoreboards

### Backend (AWS Amplify)
- **AWS Cognito** - User authentication and management
- **AWS AppSync** - GraphQL API for data operations
- **DynamoDB** - NoSQL database for score storage
- **AWS IAM** - Fine-grained access control

### Data Schema
```typescript
Score: {
  playerName: string (required)
  score: integer (required)
  level: integer (required)
  linesCleared: integer (required)
  gameDate: datetime (required)
  userId?: string (optional)
}
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Access the game**:
   - Open http://localhost:8080
   - Sign up/in or play as guest
   - Select "Play Tetris" from the main menu

## Game Features in Detail

### Scoring System
- **Single line**: 100 × level
- **Double lines**: 300 × level  
- **Triple lines**: 500 × level
- **Tetris (4 lines)**: 800 × level
- **Hard drop bonus**: 2 points per cell

### Level Progression
- **Level increases** every 10 lines cleared
- **Drop speed increases** with each level
- **Minimum drop interval**: 50ms (level 20+)

### Authentication Flow
1. **Initial screen**: Authentication component
2. **Sign up**: Email + password with verification
3. **Sign in**: Email + password authentication
4. **Guest mode**: Play without account creation
5. **Session persistence**: Stay logged in across visits

### Score Submission
1. **Game over**: Automatic score calculation
2. **Player name**: Customizable display name
3. **Save score**: Stored in DynamoDB with timestamp
4. **High score detection**: Celebration for top 10 scores
5. **Leaderboard update**: Real-time score ranking

## File Structure

```
src/
├── components/
│   ├── AuthComponent.tsx      # User authentication UI
│   ├── GameOverModal.tsx      # Post-game score submission
│   └── Scoreboard.tsx         # Leaderboard display
├── game/
│   └── scenes/
│       └── TetrisGame.ts      # Main Tetris game logic
├── services/
│   └── scoreService.ts        # Score management utilities
└── App.tsx                    # Main application component

amplify/
├── data/
│   └── resource.ts            # GraphQL schema definition
└── auth/
    └── resource.ts            # Cognito configuration
```

## Deployment

The game is designed to work with AWS Amplify's sandbox environment:

1. **Schema changes** are automatically detected
2. **Database updates** deploy automatically  
3. **Authentication** is pre-configured
4. **API endpoints** are generated automatically

## Future Enhancements

- **Multiplayer mode** with real-time competition
- **Daily challenges** with special scoring
- **Achievement system** with badges
- **Social features** like friend leaderboards
- **Mobile responsive** touch controls
- **Sound effects** and background music
- **Customizable themes** and piece colors

## Troubleshooting

### Common Issues
- **Authentication errors**: Check AWS Cognito configuration
- **Score not saving**: Verify DynamoDB permissions
- **Game not loading**: Check browser console for errors
- **Controls not working**: Ensure game canvas has focus

### Development Tips
- **Hot reload**: Changes auto-refresh in development
- **Debug mode**: Check browser dev tools for game state
- **Network tab**: Monitor API calls for score operations
- **Amplify console**: View backend logs and metrics

Enjoy playing Tetris with cloud-powered high scores! 🎮🏆

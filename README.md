# AWS Tetris Game 🎮

A modern Tetris-inspired game built with AWS services, featuring real-time leaderboards, user authentication, and educational AWS service facts. Built with Next.js, Phaser 3, and AWS Amplify.

![AWS Tetris Game Screenshot](screenshot.png)

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org) (v18 or higher)
- [AWS Account](https://aws.amazon.com/free/)
- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate permissions

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd amazonq-game-builder-challenge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up AWS Amplify Gen 2**
   ```bash
   # Deploy the backend (Amplify Gen 2)
   npx ampx sandbox
   
   # Or for production deployment
   npx ampx pipeline-deploy --branch main
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## 🎯 Features

- **🎮 Classic Tetris Gameplay** - Familiar controls with modern enhancements
- **🔐 User Authentication** - Sign up, sign in, and guest play options
- **🏆 Real-time Leaderboards** - Global high scores with user rankings
- **📚 Educational Content** - Learn about AWS services while playing
- **🎨 AWS-themed Pieces** - Each Tetris piece represents an AWS service
- **📱 Responsive Design** - Works on desktop and mobile devices
- **⚡ Real-time Updates** - Live score updates and leaderboard refresh

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   AWS Amplify   │    │   AWS Services  │
│   (Next.js)     │◄──►│   Backend       │◄──►│   (DynamoDB)    │
│   - Game Logic  │    │   - Auth        │    │   - Data Store  │
│   - UI/UX       │    │   - GraphQL API │    │   - Real-time   │
│   - Phaser 3    │    │   - Real-time   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
amplify/                # AWS Amplify Gen 2 backend
├── auth/
│   └── resource.ts         # Authentication configuration
├── data/
│   └── resource.ts         # Data schema and API configuration
├── backend.ts              # Backend definition
├── package.json            # Amplify dependencies
└── tsconfig.json           # TypeScript configuration
src/
├── components/          # React components
│   ├── AuthComponent.tsx      # User authentication UI
│   ├── GameOverModal.tsx      # Game over screen with scores
│   └── Scoreboard.tsx         # Leaderboard display
├── game/               # Phaser 3 game engine
│   ├── scenes/         # Game scenes
│   │   ├── AWSTetricsGame.ts  # Main game logic
│   │   ├── Boot.ts            # Initial loading
│   │   ├── MainMenu.ts        # Menu screen
│   │   └── Preloader.ts       # Asset loading
│   ├── EventBus.ts     # React-Phaser communication
│   └── main.ts         # Game configuration
├── services/           # Business logic services
│   └── scoreService.ts # Score management
├── utils/              # Utility functions
│   └── userUtils.ts    # User management helpers
├── data/               # Static data
│   └── awsServiceFacts.ts     # Educational content
└── pages/              # Next.js pages
    ├── _app.tsx        # App wrapper
    ├── _document.tsx   # HTML document
    └── index.tsx       # Home page
```

## 🧩 Component Documentation

### 🎮 Game Components

#### AWSTetricsGame.ts
The main game engine built with Phaser 3.

**Key Features:**
- **Tetris Logic**: Piece movement, rotation, line clearing
- **AWS Integration**: Each piece represents an AWS service
- **Scoring System**: Points based on lines cleared and level
- **Progressive Difficulty**: Speed increases with level

**Key Methods:**
```typescript
// Core game loop
update(time: number, delta: number): void

// Handle user input
handleInput(): void

// Check for completed lines
checkLines(): void

// Spawn new pieces
spawnPiece(): void
```

**AWS Service Pieces:**
- **Lambda** (T-piece): Serverless compute
- **S3** (Square): Object storage  
- **API Gateway** (L-piece): API management
- **DynamoDB** (Z-piece): NoSQL database
- **CloudFormation** (I-piece): Infrastructure as Code
- **EC2** (J-piece): Virtual servers
- **CloudWatch** (S-piece): Monitoring

#### EventBus.ts
Communication bridge between React and Phaser.

```typescript
// Emit events from React to Phaser
EventBus.emit('pause-game');

// Listen for events from Phaser in React
EventBus.on('game-over', (score) => {
  // Handle game over
});
```

### 🔐 Authentication Components

#### AuthComponent.tsx
Handles user authentication with AWS Cognito.

**Features:**
- Sign up with email verification
- Sign in with existing accounts
- Guest play mode
- Password reset functionality

**Key Functions:**
```typescript
// Sign up new user
const handleSignUp = async (email: string, password: string)

// Sign in existing user  
const handleSignIn = async (email: string, password: string)

// Confirm email verification
const handleConfirmSignUp = async (email: string, code: string)
```

#### userUtils.ts
User management utilities for display names and user info.

```typescript
// Get friendly display name from user data
export async function getUserDisplayInfo(user: any): Promise<UserDisplayInfo>

// Quick display name extraction
export function getQuickDisplayName(user: any): string
```

### 📊 Data Components

#### ScoreService.ts
Manages high scores and leaderboard functionality.

**Key Methods:**
```typescript
// Save a new score
static async saveScore(gameScore: GameScore, currentUser?: any): Promise<boolean>

// Get top scores for leaderboard
static async getTopScores(limit: number = 10): Promise<GameScore[]>
```

**Score Data Structure:**
```typescript
interface GameScore {
  playerName: string;
  score: number;
  level: number;
  linesCleared: number;
  gameDate: string;
  userId?: string;
}
```

#### Scoreboard.tsx
Real-time leaderboard display component.

**Features:**
- Auto-refresh every 30 seconds
- Highlight current user's scores
- Responsive design for mobile/desktop
- Loading states and error handling

### 📚 Educational Components

#### awsServiceFacts.ts
Educational content about AWS services.

**Data Structure:**
```typescript
interface AWSServiceFact {
  service: string;        // Service name
  iconPath: string;       // Path to service icon
  fact: string;          // Interesting fact
  category: string;       // Service category
  launchYear: number;     // When service launched
}
```

**Example Fact:**
```typescript
LAMBDA: {
  service: "AWS Lambda",
  iconPath: "/assets/aws-icons/Lambda.png",
  fact: "AWS Lambda can automatically scale from zero to thousands of concurrent executions in seconds!",
  category: "Serverless Compute",
  launchYear: 2014
}
```

## 🛠️ AWS Services Used

### AWS Amplify Gen 2
**Purpose**: Full-stack development platform with code-first approach
- **Authentication**: User sign-up, sign-in, and management via Cognito
- **API**: GraphQL API with real-time subscriptions
- **Data**: Type-safe data layer with DynamoDB
- **Hosting**: Static site hosting and CI/CD

**Gen 2 Benefits:**
- **Code-first approach**: Define your backend using TypeScript
- **Type safety**: Full-stack type safety from backend to frontend
- **Local development**: `npx ampx sandbox` for local backend development
- **Git-based deployments**: Automatic deployments via Git branches
- **No CLI required**: Everything defined in code, no separate CLI configuration

**Backend Structure:**
```typescript
// amplify/backend.ts
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

defineBackend({
  auth,
  data,
});
```

### Amazon DynamoDB
**Purpose**: NoSQL database for storing game scores
- **Table**: Stores player scores, names, and game statistics
- **Real-time**: Supports real-time queries for leaderboards
- **Scalability**: Automatically scales with user demand

### Amazon Cognito
**Purpose**: User authentication and management
- **User Pools**: Manage user accounts and authentication
- **Email Verification**: Secure account creation process
- **Guest Access**: Allow anonymous gameplay

## 🎮 Game Controls

| Key | Action |
|-----|--------|
| ← → | Move piece left/right |
| ↓ | Soft drop (faster fall) |
| ↑ | Rotate piece |
| Space | Hard drop (instant fall) |
| P | Pause/Resume game |
| R | Restart game (when game over) |

## 🏆 Scoring System

- **Single Line**: 100 × level
- **Double Lines**: 300 × level  
- **Triple Lines**: 500 × level
- **Tetris (4 lines)**: 800 × level
- **Soft Drop**: 1 point per cell
- **Hard Drop**: 2 points per cell

## 🔧 Configuration

### Environment Variables
Amplify Gen 2 automatically generates the configuration file:
```typescript
// amplify_outputs.json is auto-generated
// No manual environment variables needed for Amplify Gen 2
```

For custom environment variables, create a `.env.local` file:
```env
# Custom environment variables (if needed)
NEXT_PUBLIC_CUSTOM_VARIABLE=your-value
```

### Game Settings
Modify game settings in `src/game/scenes/AWSTetricsGame.ts`:
```typescript
// Board dimensions
private readonly BOARD_WIDTH = 10;
private readonly BOARD_HEIGHT = 20;

// Initial game speed
private dropInterval: number = 1000; // milliseconds

// Level progression
private readonly LINES_PER_LEVEL = 10;
```

## 🚀 Deployment

### Development
```bash
npm run dev        # Start development server
npm run dev-nolog  # Start without analytics logging
```

### Production
```bash
npm run build      # Build for production
npm run build-nolog # Build without analytics logging
```

### AWS Amplify Hosting
```bash
# Deploy to AWS
npx ampx pipeline-deploy --branch main

# Or use the Amplify Console for CI/CD
# Connect your GitHub repository for automatic deployments
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] User can sign up with email
- [ ] Email verification works
- [ ] User can sign in
- [ ] Guest mode works
- [ ] Game controls respond correctly
- [ ] Scores save to leaderboard
- [ ] Leaderboard updates in real-time
- [ ] AWS service facts display correctly
- [ ] Game works on mobile devices

### Performance Testing
- [ ] Game runs at 60 FPS
- [ ] No memory leaks during extended play
- [ ] Fast loading times
- [ ] Responsive UI interactions

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Amplify Issues**
```bash
# Reset Amplify backend
npx ampx sandbox delete
npx ampx sandbox
```

**Game Performance**
- Check browser console for errors
- Ensure hardware acceleration is enabled
- Close other browser tabs to free memory

### Debug Mode
Enable debug logging by adding to localStorage:
```javascript
localStorage.setItem('debug', 'true');
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Add JSDoc comments for public methods
- Write descriptive commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Phaser 3** - Amazing game development framework
- **Next.js** - React framework for production
- **AWS Amplify** - Full-stack development platform
- **AWS Services** - Powering the backend infrastructure

## 📞 Support

- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)
- **AWS Documentation**: [AWS Amplify Docs](https://docs.amplify.aws/)

---

**Built with ❤️ using AWS services and modern web technologies**

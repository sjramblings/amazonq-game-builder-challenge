import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

// AWS-themed Tetris pieces with service names and colors
const AWS_TETRIS_PIECES = {
    LAMBDA: [  // I-piece - AWS Lambda (Serverless)
        [1, 1, 1, 1]
    ],
    S3: [      // O-piece - AWS S3 (Storage)
        [1, 1],
        [1, 1]
    ],
    API_GATEWAY: [ // T-piece - AWS API Gateway
        [0, 1, 0],
        [1, 1, 1]
    ],
    DYNAMODB: [    // S-piece - AWS DynamoDB
        [0, 1, 1],
        [1, 1, 0]
    ],
    CLOUDFORMATION: [ // Z-piece - AWS CloudFormation
        [1, 1, 0],
        [0, 1, 1]
    ],
    EC2: [     // J-piece - AWS EC2
        [1, 0, 0],
        [1, 1, 1]
    ],
    CLOUDWATCH: [  // L-piece - AWS CloudWatch
        [0, 0, 1],
        [1, 1, 1]
    ]
};

const AWS_SERVICE_COLORS = {
    LAMBDA: 0xFF9900,      // AWS Orange
    S3: 0x3F8624,          // AWS Green  
    API_GATEWAY: 0x9D5AAE, // AWS Purple
    DYNAMODB: 0x3F48CC,    // AWS Blue
    CLOUDFORMATION: 0xFF4B4B, // AWS Red-Orange
    EC2: 0xFF9900,         // AWS Orange
    CLOUDWATCH: 0xE31837   // AWS Red
};

const AWS_SERVICE_NAMES = {
    LAMBDA: 'AWS Lambda',
    S3: 'Amazon S3',
    API_GATEWAY: 'API Gateway',
    DYNAMODB: 'DynamoDB',
    CLOUDFORMATION: 'CloudFormation',
    EC2: 'Amazon EC2',
    CLOUDWATCH: 'CloudWatch'
};

interface AWSTetricsePiece {
    shape: number[][];
    x: number;
    y: number;
    type: keyof typeof AWS_TETRIS_PIECES;
    color: number;
    serviceName: string;
}

export class AWSTetricsGame extends Scene {
    private board: number[][];
    private currentPiece: AWSTetricsePiece | null = null;
    private nextPiece: AWSTetricsePiece | null = null;
    private score: number = 0;
    private level: number = 1;
    private lines: number = 0;
    private dropTime: number = 0;
    private dropInterval: number = 1000;
    private gameOver: boolean = false;
    private isPaused: boolean = false;
    
    // Display elements
    private boardGraphics!: Phaser.GameObjects.Graphics;
    private scoreText!: Phaser.GameObjects.Text;
    private levelText!: Phaser.GameObjects.Text;
    private linesText!: Phaser.GameObjects.Text;
    private nextPieceGraphics!: Phaser.GameObjects.Graphics;
    private nextServiceText!: Phaser.GameObjects.Text;
    private currentServiceText!: Phaser.GameObjects.Text;
    private gameOverText!: Phaser.GameObjects.Text;
    private pauseText!: Phaser.GameObjects.Text;
    private awsLogoText!: Phaser.GameObjects.Text;
    
    // Game constants
    private readonly BOARD_WIDTH = 10;
    private readonly BOARD_HEIGHT = 20;
    private readonly BLOCK_SIZE = 30;
    private readonly BOARD_X = 50;
    private readonly BOARD_Y = 80;

    constructor() {
        super('AWSTetricsGame');
    }

    create() {
        // Initialize game board
        this.initializeBoard();
        
        // Create graphics objects
        this.createGraphics();
        
        // Create UI elements
        this.createUI();
        
        // Set up input
        this.setupInput();
        
        // Start the game
        this.spawnNewPiece();
        
        // Emit scene ready event
        EventBus.emit('current-scene-ready', this);
    }

    private initializeBoard() {
        this.board = Array(this.BOARD_HEIGHT).fill(null).map(() => Array(this.BOARD_WIDTH).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.isPaused = false;
        this.dropTime = 0;
        this.dropInterval = 1000;
    }

    private createGraphics() {
        // Main game board
        this.boardGraphics = this.add.graphics();
        
        // Next piece preview
        this.nextPieceGraphics = this.add.graphics();
        
        // Draw board border with AWS styling
        this.boardGraphics.lineStyle(3, 0xFF9900); // AWS Orange border
        this.boardGraphics.strokeRect(
            this.BOARD_X - 3, 
            this.BOARD_Y - 3, 
            this.BOARD_WIDTH * this.BLOCK_SIZE + 6, 
            this.BOARD_HEIGHT * this.BLOCK_SIZE + 6
        );
    }

    private createUI() {
        const uiX = this.BOARD_X + this.BOARD_WIDTH * this.BLOCK_SIZE + 50;
        
        // AWS Tetrics Title
        this.awsLogoText = this.add.text(this.cameras.main.centerX, 20, '☁️ AWS TETRICS ☁️', { 
            fontSize: '32px', 
            color: '#FF9900',
            fontFamily: 'Arial Black',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Score display
        this.add.text(uiX, 120, 'SCORE', { 
            fontSize: '24px', 
            color: '#FFFFFF',
            fontFamily: 'Arial Black'
        });
        this.scoreText = this.add.text(uiX, 150, '0', { 
            fontSize: '32px', 
            color: '#FF9900',
            fontFamily: 'Arial Black'
        });

        // Level display
        this.add.text(uiX, 200, 'LEVEL', { 
            fontSize: '24px', 
            color: '#FFFFFF',
            fontFamily: 'Arial Black'
        });
        this.levelText = this.add.text(uiX, 230, '1', { 
            fontSize: '32px', 
            color: '#3F8624',
            fontFamily: 'Arial Black'
        });

        // Lines display
        this.add.text(uiX, 280, 'LINES', { 
            fontSize: '24px', 
            color: '#FFFFFF',
            fontFamily: 'Arial Black'
        });
        this.linesText = this.add.text(uiX, 310, '0', { 
            fontSize: '32px', 
            color: '#3F48CC',
            fontFamily: 'Arial Black'
        });

        // Current service display
        this.add.text(uiX, 360, 'CURRENT SERVICE', { 
            fontSize: '18px', 
            color: '#FFFFFF',
            fontFamily: 'Arial'
        });
        this.currentServiceText = this.add.text(uiX, 385, '', { 
            fontSize: '16px', 
            color: '#FF9900',
            fontFamily: 'Arial',
            wordWrap: { width: 200 }
        });

        // Next piece display
        this.add.text(uiX, 440, 'NEXT SERVICE', { 
            fontSize: '18px', 
            color: '#FFFFFF',
            fontFamily: 'Arial'
        });
        this.nextServiceText = this.add.text(uiX, 465, '', { 
            fontSize: '16px', 
            color: '#FF9900',
            fontFamily: 'Arial',
            wordWrap: { width: 200 }
        });

        // Controls
        this.add.text(uiX, 550, 'CONTROLS:', { 
            fontSize: '18px', 
            color: '#FF9900',
            fontFamily: 'Arial Black'
        });
        this.add.text(uiX, 580, '← → Move', { 
            fontSize: '14px', 
            color: '#CCCCCC',
            fontFamily: 'Arial'
        });
        this.add.text(uiX, 600, '↓ Soft Drop', { 
            fontSize: '14px', 
            color: '#CCCCCC',
            fontFamily: 'Arial'
        });
        this.add.text(uiX, 620, '↑ Rotate', { 
            fontSize: '14px', 
            color: '#CCCCCC',
            fontFamily: 'Arial'
        });
        this.add.text(uiX, 640, 'SPACE Hard Drop', { 
            fontSize: '14px', 
            color: '#CCCCCC',
            fontFamily: 'Arial'
        });
        this.add.text(uiX, 660, 'P Pause', { 
            fontSize: '14px', 
            color: '#CCCCCC',
            fontFamily: 'Arial'
        });

        // AWS Branding
        this.add.text(uiX, 720, 'Powered by AWS ☁️', { 
            fontSize: '14px', 
            color: '#FF9900',
            fontFamily: 'Arial',
            fontStyle: 'italic'
        });

        // Game over text (hidden initially)
        this.gameOverText = this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY, 
            'GAME OVER\n☁️ AWS Services Deployed! ☁️\nPress R to Restart', 
            { 
                fontSize: '36px', 
                color: '#FF4B4B',
                fontFamily: 'Arial Black',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5).setVisible(false);

        // Pause text (hidden initially)
        this.pauseText = this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY, 
            'PAUSED\n☁️ Services on Standby ☁️\nPress P to Resume', 
            { 
                fontSize: '36px', 
                color: '#FF9900',
                fontFamily: 'Arial Black',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5).setVisible(false);
    }

    private setupInput() {
        const cursors = this.input.keyboard!.createCursorKeys();
        const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        const pKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        const rKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        // Movement controls
        cursors.left!.on('down', () => this.movePiece(-1, 0));
        cursors.right!.on('down', () => this.movePiece(1, 0));
        cursors.down!.on('down', () => this.movePiece(0, 1));
        cursors.up!.on('down', () => this.rotatePiece());
        
        // Hard drop
        spaceKey.on('down', () => this.hardDrop());
        
        // Pause
        pKey.on('down', () => this.togglePause());
        
        // Restart
        rKey.on('down', () => {
            if (this.gameOver) {
                this.restartGame();
            }
        });
    }

    update(time: number, delta: number) {
        if (this.gameOver || this.isPaused) return;

        this.dropTime += delta;
        if (this.dropTime >= this.dropInterval) {
            this.dropPiece();
            this.dropTime = 0;
        }

        this.render();
    }

    private spawnNewPiece() {
        if (this.nextPiece) {
            this.currentPiece = this.nextPiece;
        } else {
            this.currentPiece = this.createRandomPiece();
        }
        
        this.nextPiece = this.createRandomPiece();
        
        // Reset position
        this.currentPiece.x = Math.floor(this.BOARD_WIDTH / 2) - 1;
        this.currentPiece.y = 0;

        // Update service displays
        this.updateServiceDisplays();

        // Check for game over
        if (this.isCollision(this.currentPiece, 0, 0)) {
            this.endGame();
        }
    }

    private createRandomPiece(): AWSTetricsePiece {
        const services = Object.keys(AWS_TETRIS_PIECES) as (keyof typeof AWS_TETRIS_PIECES)[];
        const randomService = services[Math.floor(Math.random() * services.length)];
        
        return {
            shape: AWS_TETRIS_PIECES[randomService],
            x: 0,
            y: 0,
            type: randomService,
            color: AWS_SERVICE_COLORS[randomService],
            serviceName: AWS_SERVICE_NAMES[randomService]
        };
    }

    private updateServiceDisplays() {
        if (this.currentPiece) {
            this.currentServiceText.setText(this.currentPiece.serviceName);
        }
        if (this.nextPiece) {
            this.nextServiceText.setText(this.nextPiece.serviceName);
        }
    }

    private movePiece(dx: number, dy: number) {
        if (!this.currentPiece || this.gameOver || this.isPaused) return;

        if (!this.isCollision(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
        }
    }

    private rotatePiece() {
        if (!this.currentPiece || this.gameOver || this.isPaused) return;

        const rotated = this.rotateMatrix(this.currentPiece.shape);
        const originalShape = this.currentPiece.shape;
        
        this.currentPiece.shape = rotated;
        
        if (this.isCollision(this.currentPiece, 0, 0)) {
            this.currentPiece.shape = originalShape; // Revert rotation
        }
    }

    private rotateMatrix(matrix: number[][]): number[][] {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0));
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                rotated[j][rows - 1 - i] = matrix[i][j];
            }
        }
        
        return rotated;
    }

    private dropPiece() {
        if (!this.currentPiece || this.gameOver || this.isPaused) return;

        if (!this.isCollision(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
        } else {
            this.placePiece();
            this.clearLines();
            this.spawnNewPiece();
        }
    }

    private hardDrop() {
        if (!this.currentPiece || this.gameOver || this.isPaused) return;

        while (!this.isCollision(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
            this.score += 2; // Bonus points for hard drop
        }
        
        this.placePiece();
        this.clearLines();
        this.spawnNewPiece();
    }

    private isCollision(piece: AWSTetricsePiece, dx: number, dy: number): boolean {
        const newX = piece.x + dx;
        const newY = piece.y + dy;

        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const boardX = newX + x;
                    const boardY = newY + y;

                    // Check boundaries
                    if (boardX < 0 || boardX >= this.BOARD_WIDTH || 
                        boardY >= this.BOARD_HEIGHT) {
                        return true;
                    }

                    // Check collision with placed pieces
                    if (boardY >= 0 && this.board[boardY][boardX]) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private placePiece() {
        if (!this.currentPiece) return;

        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;
                    
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
    }

    private clearLines() {
        let linesCleared = 0;
        
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++; // Check the same line again
            }
        }

        if (linesCleared > 0) {
            this.lines += linesCleared;
            
            // AWS-themed scoring system
            const lineScores = [0, 100, 300, 500, 800];
            this.score += lineScores[linesCleared] * this.level;
            
            // Level progression
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);
            
            this.updateUI();
        }
    }

    private updateUI() {
        this.scoreText.setText(this.score.toString());
        this.levelText.setText(this.level.toString());
        this.linesText.setText(this.lines.toString());
    }

    private togglePause() {
        if (this.gameOver) return;
        
        this.isPaused = !this.isPaused;
        this.pauseText.setVisible(this.isPaused);
    }

    private endGame() {
        this.gameOver = true;
        this.gameOverText.setVisible(true);
        
        // Emit game over event with score data
        EventBus.emit('game-over', {
            score: this.score,
            level: this.level,
            lines: this.lines
        });
    }

    private restartGame() {
        this.gameOverText.setVisible(false);
        this.initializeBoard();
        this.updateUI();
        this.spawnNewPiece();
        this.render();
    }

    private render() {
        this.boardGraphics.clear();
        
        // Draw board border with AWS styling
        this.boardGraphics.lineStyle(3, 0xFF9900);
        this.boardGraphics.strokeRect(
            this.BOARD_X - 3, 
            this.BOARD_Y - 3, 
            this.BOARD_WIDTH * this.BLOCK_SIZE + 6, 
            this.BOARD_HEIGHT * this.BLOCK_SIZE + 6
        );

        // Draw placed pieces
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    this.drawAWSBlock(
                        this.boardGraphics,
                        this.BOARD_X + x * this.BLOCK_SIZE,
                        this.BOARD_Y + y * this.BLOCK_SIZE,
                        this.board[y][x]
                    );
                }
            }
        }

        // Draw current piece
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        this.drawAWSBlock(
                            this.boardGraphics,
                            this.BOARD_X + (this.currentPiece.x + x) * this.BLOCK_SIZE,
                            this.BOARD_Y + (this.currentPiece.y + y) * this.BLOCK_SIZE,
                            this.currentPiece.color
                        );
                    }
                }
            }
        }

        // Draw next piece preview
        this.renderNextPiece();
    }

    private renderNextPiece() {
        this.nextPieceGraphics.clear();
        
        if (this.nextPiece) {
            const previewX = this.BOARD_X + this.BOARD_WIDTH * this.BLOCK_SIZE + 50;
            const previewY = 490;
            
            for (let y = 0; y < this.nextPiece.shape.length; y++) {
                for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                    if (this.nextPiece.shape[y][x]) {
                        this.drawAWSBlock(
                            this.nextPieceGraphics,
                            previewX + x * (this.BLOCK_SIZE * 0.7),
                            previewY + y * (this.BLOCK_SIZE * 0.7),
                            this.nextPiece.color,
                            0.7
                        );
                    }
                }
            }
        }
    }

    private drawAWSBlock(graphics: Phaser.GameObjects.Graphics, x: number, y: number, color: number, scale: number = 1) {
        const size = this.BLOCK_SIZE * scale;
        
        // Main block color
        graphics.fillStyle(color);
        graphics.fillRect(x, y, size, size);
        
        // AWS-style gradient effect
        graphics.fillStyle(color, 0.8);
        graphics.fillRect(x + 2, y + 2, size - 4, size - 4);
        
        // Highlight
        graphics.fillStyle(0xFFFFFF, 0.3);
        graphics.fillRect(x + 1, y + 1, size - 2, 3);
        graphics.fillRect(x + 1, y + 1, 3, size - 2);
        
        // Border
        graphics.lineStyle(1, 0x000000, 0.5);
        graphics.strokeRect(x, y, size, size);
        
        // AWS cloud icon in center (simplified)
        if (scale === 1) {
            graphics.fillStyle(0xFFFFFF, 0.8);
            const centerX = x + size / 2;
            const centerY = y + size / 2;
            graphics.fillCircle(centerX, centerY, 3);
            graphics.fillCircle(centerX - 4, centerY, 2);
            graphics.fillCircle(centerX + 4, centerY, 2);
        }
    }

    // Public method to get current game state
    public getGameState() {
        return {
            score: this.score,
            level: this.level,
            lines: this.lines,
            gameOver: this.gameOver,
            isPaused: this.isPaused
        };
    }
}

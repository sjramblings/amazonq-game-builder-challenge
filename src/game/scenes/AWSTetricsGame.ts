import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { getRandomServiceFact } from '../../data/awsServiceFacts';

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
const AWS_SERVICE_ICONS = {
    LAMBDA: 'aws-lambda',
    S3: 'aws-s3',
    API_GATEWAY: 'aws-api-gateway',
    DYNAMODB: 'aws-dynamodb',
    CLOUDFORMATION: 'aws-cloudformation',
    EC2: 'aws-ec2',
    CLOUDWATCH: 'aws-cloudwatch'
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
    private board: (null | { color: number; serviceType: keyof typeof AWS_TETRIS_PIECES })[][];
    private currentPiece: AWSTetricsePiece | null = null;
    private nextPiece: AWSTetricsePiece | null = null;
    private lastPlacedService: keyof typeof AWS_TETRIS_PIECES | null = null;
    private score: number = 0;
    private level: number = 1;
    private lines: number = 0;
    private dropTime: number = 0;
    private dropInterval: number = 1000;
    private gameOver: boolean = false;
    private isPaused: boolean = false;
    
    // Service icons for blocks
    private serviceIcons: Phaser.GameObjects.Image[] = [];    
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
    
    // Game constants - now responsive
    private readonly BASE_BOARD_WIDTH = 10;
    private readonly BASE_BOARD_HEIGHT = 20;
    private BLOCK_SIZE = 30;
    private BOARD_X = 50;
    private BOARD_Y = 80;

    constructor() {
        super('AWSTetricsGame');
    }

    create() {
        // Calculate responsive dimensions
        this.calculateResponsiveDimensions();
        
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

    private calculateResponsiveDimensions() {
        const scaleX = this.scale.width / 1024; // Base width
        const scaleY = this.scale.height / 768;  // Base height
        const scale = Math.min(scaleX, scaleY);
        
        // Responsive block size with better constraints
        this.BLOCK_SIZE = Math.max(18, Math.min(35, 28 * scale));
        
        // Calculate board dimensions
        const boardWidth = this.BASE_BOARD_WIDTH * this.BLOCK_SIZE;
        const boardHeight = this.BASE_BOARD_HEIGHT * this.BLOCK_SIZE;
        
        // Better positioning - leave more space for UI on the right
        const availableWidth = this.scale.width - 300; // Reserve 300px for UI
        this.BOARD_X = Math.max(20, (availableWidth - boardWidth) / 2);
        this.BOARD_Y = Math.max(80, (this.scale.height - boardHeight) * 0.15);
        
        // Ensure board doesn't go off screen
        if (this.BOARD_X + boardWidth > this.scale.width - 280) {
            this.BOARD_X = Math.max(20, this.scale.width - boardWidth - 280);
        }
        
        if (this.BOARD_Y + boardHeight > this.scale.height - 50) {
            this.BOARD_Y = Math.max(50, this.scale.height - boardHeight - 50);
            // If still doesn't fit, reduce block size
            if (this.BOARD_Y + boardHeight > this.scale.height - 50) {
                this.BLOCK_SIZE = Math.max(15, (this.scale.height - 150) / this.BASE_BOARD_HEIGHT);
                this.BOARD_Y = Math.max(50, (this.scale.height - this.BASE_BOARD_HEIGHT * this.BLOCK_SIZE) / 2);
            }
        }
    }

    private get BOARD_WIDTH() { return this.BASE_BOARD_WIDTH; }
    private get BOARD_HEIGHT() { return this.BASE_BOARD_HEIGHT; }

    private initializeBoard() {
        this.board = Array(this.BOARD_HEIGHT).fill(null).map(() => Array(this.BOARD_WIDTH).fill(null));
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
        const uiX = this.getUIX();
        const scale = this.getUIScale();
        
        // AWS Tetrics Title
        this.awsLogoText = this.add.text(this.scale.width / 2, this.getTitleY(), '☁️ AWS TETRIS ☁️', { 
            fontSize: this.getTitleFontSize() + 'px', 
            color: '#FF9900',
            fontFamily: 'Arial Black',
            stroke: '#000000',
            strokeThickness: Math.max(1, Math.floor(2 * scale))
        }).setOrigin(0.5);

        // Score display
        this.add.text(uiX, this.getScoreY(), 'SCORE', { 
            fontSize: this.getHeaderFontSize() + 'px', 
            color: '#FFFFFF',
            fontFamily: 'Arial Black'
        });
        this.scoreText = this.add.text(uiX, this.getScoreValueY(), '0', { 
            fontSize: this.getValueFontSize() + 'px', 
            color: '#FF9900',
            fontFamily: 'Arial Black'
        });

        // Level display
        this.add.text(uiX, this.getLevelY(), 'LEVEL', { 
            fontSize: this.getHeaderFontSize() + 'px', 
            color: '#FFFFFF',
            fontFamily: 'Arial Black'
        });
        this.levelText = this.add.text(uiX, this.getLevelValueY(), '1', { 
            fontSize: this.getValueFontSize() + 'px', 
            color: '#3F8624',
            fontFamily: 'Arial Black'
        });

        // Lines display
        this.add.text(uiX, this.getLinesY(), 'LINES', { 
            fontSize: this.getHeaderFontSize() + 'px', 
            color: '#FFFFFF',
            fontFamily: 'Arial Black'
        });
        this.linesText = this.add.text(uiX, this.getLinesValueY(), '0', { 
            fontSize: this.getValueFontSize() + 'px', 
            color: '#3F48CC',
            fontFamily: 'Arial Black'
        });

        // Current service display
        this.add.text(uiX, this.getCurrentServiceY(), 'CURRENT SERVICE', { 
            fontSize: this.getServiceHeaderFontSize() + 'px', 
            color: '#FFFFFF',
            fontFamily: 'Arial'
        });
        this.currentServiceText = this.add.text(uiX, this.getCurrentServiceValueY(), '', { 
            fontSize: this.getServiceFontSize() + 'px', 
            color: '#FF9900',
            fontFamily: 'Arial',
            wordWrap: { width: this.getServiceTextWidth() }
        });

        // Next piece display
        this.add.text(uiX, this.getNextServiceY(), 'NEXT SERVICE', { 
            fontSize: this.getServiceHeaderFontSize() + 'px', 
            color: '#FFFFFF',
            fontFamily: 'Arial'
        });
        this.nextServiceText = this.add.text(uiX, this.getNextServiceValueY(), '', { 
            fontSize: this.getServiceFontSize() + 'px', 
            color: '#FF9900',
            fontFamily: 'Arial',
            wordWrap: { width: this.getServiceTextWidth() }
        });

        this.createControlsUI(uiX);
        this.createGameOverUI();
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

        // Track the last placed service for the fact display
        this.lastPlacedService = this.currentPiece.type;

        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;
                    
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = {
                            color: this.currentPiece.color,
                            serviceType: this.currentPiece.type
                        };
                    }
                }
            }
        }
    }

    private clearLines() {
        let linesCleared = 0;
        
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== null)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(null));
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
        
        // Get the AWS service fact for the last placed service
        const serviceFact = this.lastPlacedService ? getRandomServiceFact(this.lastPlacedService) : null;
        
        // Emit game over event with score data and service fact
        EventBus.emit('game-over', {
            score: this.score,
            level: this.level,
            lines: this.lines,
            lastService: serviceFact
        });
    }

    public restartGame() {
        // Reset all game state
        this.gameOver = false;
        this.isPaused = false;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTime = 0; // Reset to 0 for manual timing
        this.dropInterval = 1000; // Reset drop interval
        this.lastPlacedService = null;
        
        // Hide game over text
        this.gameOverText.setVisible(false);
        this.pauseText.setVisible(false);
        
        // Reset board and UI
        this.initializeBoard();
        this.updateUI();
        this.spawnNewPiece();
        this.render();
        
        // Restart the drop timer
        if (this.dropTimer) {
            this.dropTimer.destroy();
        }
        this.dropTimer = this.time.addEvent({
            delay: this.dropInterval,
            callback: this.dropPiece,
            callbackScope: this,
            loop: true
        });
    }

    private render() {
        this.boardGraphics.clear();
        
        // Clear existing service icons
        this.clearServiceIcons();        
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
                        this.board[y][x].color
                    );
                    
                    // Add service icon
                    this.addServiceIcon(
                        this.BOARD_X + x * this.BLOCK_SIZE,
                        this.BOARD_Y + y * this.BLOCK_SIZE,
                        this.board[y][x].serviceType
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
                        
                        // Add service icon for current piece
                        this.addServiceIcon(
                            this.BOARD_X + (this.currentPiece.x + x) * this.BLOCK_SIZE,
                            this.BOARD_Y + (this.currentPiece.y + y) * this.BLOCK_SIZE,
                            this.currentPiece.type
                        );                    }
                }
            }
        }

        // Draw next piece preview
        this.renderNextPiece();
    }

    private renderNextPiece() {
        this.nextPieceGraphics.clear();
        
        if (this.nextPiece) {
            const previewX = this.getUIX();
            const previewY = this.getNextServiceValueY() + Math.max(25, 35 * this.getUIScale());
            const previewScale = 0.6;
            
            // Only render if there's space
            if (previewY + 100 < this.scale.height) {
                for (let y = 0; y < this.nextPiece.shape.length; y++) {
                    for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                        if (this.nextPiece.shape[y][x]) {
                            this.drawAWSBlock(
                                this.nextPieceGraphics,
                                previewX + x * (this.BLOCK_SIZE * previewScale),
                                previewY + y * (this.BLOCK_SIZE * previewScale),
                                this.nextPiece.color,
                                previewScale
                            );
                            
                            // Add service icon for next piece preview
                            this.addServiceIcon(
                                previewX + x * (this.BLOCK_SIZE * previewScale),
                                previewY + y * (this.BLOCK_SIZE * previewScale),
                                this.nextPiece.type,
                                previewScale
                            );
                        }
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
    private clearServiceIcons() {
        // Remove all existing service icons
        this.serviceIcons.forEach(icon => icon.destroy());
        this.serviceIcons = [];
    }

    private addServiceIcon(x: number, y: number, serviceType: keyof typeof AWS_TETRIS_PIECES, scale: number = 1) {
        const iconKey = AWS_SERVICE_ICONS[serviceType];
        if (iconKey) {
            const size = this.BLOCK_SIZE * scale;
            const iconSize = Math.max(12, size * 0.6);
            const iconX = x + size / 2;
            const iconY = y + size / 2;
            
            const icon = this.add.image(iconX, iconY, iconKey);
            icon.setDisplaySize(iconSize, iconSize);
            icon.setDepth(10); // Ensure icons are on top
            this.serviceIcons.push(icon);
        }
    }
    // Responsive helper methods
    private getUIScale() {
        const scaleX = this.scale.width / 1024;
        const scaleY = this.scale.height / 768;
        return Math.min(scaleX, scaleY);
    }

    private getUIX() {
        const boardWidth = this.BOARD_WIDTH * this.BLOCK_SIZE;
        const availableWidth = this.scale.width - (this.BOARD_X + boardWidth);
        const minSpacing = 30;
        
        // Ensure minimum spacing from board and don't go too far right
        return Math.min(
            this.BOARD_X + boardWidth + minSpacing,
            this.scale.width - 250 // Reserve space for UI elements
        );
    }

    private getTitleY() {
        return Math.max(30, 40 * this.getUIScale());
    }

    private getTitleFontSize() {
        return Math.max(20, Math.min(36, 28 * this.getUIScale()));
    }

    private getScoreY() {
        return Math.max(100, 140 * this.getUIScale());
    }

    private getScoreValueY() {
        return this.getScoreY() + Math.max(25, 35 * this.getUIScale());
    }

    private getLevelY() {
        return this.getScoreValueY() + Math.max(40, 60 * this.getUIScale());
    }

    private getLevelValueY() {
        return this.getLevelY() + Math.max(25, 35 * this.getUIScale());
    }

    private getLinesY() {
        return this.getLevelValueY() + Math.max(40, 60 * this.getUIScale());
    }

    private getLinesValueY() {
        return this.getLinesY() + Math.max(25, 35 * this.getUIScale());
    }

    private getCurrentServiceY() {
        return this.getLinesValueY() + Math.max(50, 80 * this.getUIScale());
    }

    private getCurrentServiceValueY() {
        return this.getCurrentServiceY() + Math.max(20, 30 * this.getUIScale());
    }

    private getNextServiceY() {
        return this.getCurrentServiceValueY() + Math.max(50, 80 * this.getUIScale());
    }

    private getNextServiceValueY() {
        return this.getNextServiceY() + Math.max(20, 30 * this.getUIScale());
    }

    private getHeaderFontSize() {
        return Math.max(14, Math.min(24, 20 * this.getUIScale()));
    }

    private getValueFontSize() {
        return Math.max(18, Math.min(32, 28 * this.getUIScale()));
    }

    private getServiceHeaderFontSize() {
        return Math.max(12, Math.min(18, 16 * this.getUIScale()));
    }

    private getServiceFontSize() {
        return Math.max(10, Math.min(16, 14 * this.getUIScale()));
    }

    private getServiceTextWidth() {
        const availableWidth = this.scale.width - this.getUIX() - 20;
        return Math.max(150, Math.min(250, availableWidth));
    }

    private createControlsUI(uiX: number) {
        const controlsStartY = this.getNextServiceValueY() + Math.max(60, 100 * this.getUIScale());
        const controlsFontSize = Math.max(12, Math.min(18, 16 * this.getUIScale()));
        const controlsItemFontSize = Math.max(10, Math.min(14, 12 * this.getUIScale()));
        const lineSpacing = Math.max(18, 25 * this.getUIScale());

        // Only show controls if there's enough space
        if (controlsStartY + 200 > this.scale.height) {
            return; // Skip controls if not enough vertical space
        }

        this.add.text(uiX, controlsStartY, 'CONTROLS:', { 
            fontSize: controlsFontSize + 'px', 
            color: '#FF9900',
            fontFamily: 'Arial Black'
        });
        
        const controls = [
            '← → Move',
            '↓ Drop', 
            '↑ Rotate',
            'SPACE Fast Drop',
            'P Pause'
        ];

        controls.forEach((control, index) => {
            const yPos = controlsStartY + (index + 1) * lineSpacing;
            if (yPos < this.scale.height - 50) { // Only show if fits on screen
                this.add.text(uiX, yPos, control, { 
                    fontSize: controlsItemFontSize + 'px', 
                    color: '#CCCCCC',
                    fontFamily: 'Arial'
                });
            }
        });

        // AWS Branding - only if space available
        const brandingY = controlsStartY + (controls.length + 2) * lineSpacing;
        if (brandingY < this.scale.height - 30) {
            this.add.text(uiX, brandingY, 'Powered by AWS ☁️', { 
                fontSize: controlsItemFontSize + 'px', 
                color: '#FF9900',
                fontFamily: 'Arial',
                fontStyle: 'italic'
            });
        }
    }

    private createGameOverUI() {
        const gameOverFontSize = Math.max(18, Math.min(48, 36 * this.getUIScale()));
        
        // Game over text (hidden initially)
        this.gameOverText = this.add.text(
            this.scale.width / 2, 
            this.scale.height / 2, 
            'GAME OVER\n☁️ AWS Services Deployed! ☁️\nPress R to Restart', 
            { 
                fontSize: gameOverFontSize + 'px', 
                color: '#FF4B4B',
                fontFamily: 'Arial Black',
                align: 'center',
                stroke: '#000000',
                strokeThickness: Math.max(1, Math.floor(2 * this.getUIScale()))
            }
        ).setOrigin(0.5).setVisible(false);

        // Pause text (hidden initially)
        this.pauseText = this.add.text(
            this.scale.width / 2, 
            this.scale.height / 2, 
            'PAUSED\n☁️ Services on Standby ☁️\nPress P to Resume', 
            { 
                fontSize: gameOverFontSize + 'px', 
                color: '#FF9900',
                fontFamily: 'Arial Black',
                align: 'center',
                stroke: '#000000',
                strokeThickness: Math.max(1, Math.floor(2 * this.getUIScale()))
            }
        ).setOrigin(0.5).setVisible(false);
    }

    // Resize method called when screen size changes
    public resize() {
        // Recalculate responsive dimensions
        this.calculateResponsiveDimensions();
        
        // Clear and recreate graphics
        this.boardGraphics.clear();
        this.nextPieceGraphics.clear();
        
        // Recreate board border
        this.boardGraphics.lineStyle(3, 0xFF9900);
        this.boardGraphics.strokeRect(
            this.BOARD_X - 3, 
            this.BOARD_Y - 3, 
            this.BOARD_WIDTH * this.BLOCK_SIZE + 6, 
            this.BOARD_HEIGHT * this.BLOCK_SIZE + 6
        );

        // Clear all existing UI elements and recreate them
        this.children.removeAll();
        
        // Recreate graphics objects
        this.boardGraphics = this.add.graphics();
        this.nextPieceGraphics = this.add.graphics();
        
        // Recreate board border
        this.boardGraphics.lineStyle(3, 0xFF9900);
        this.boardGraphics.strokeRect(
            this.BOARD_X - 3, 
            this.BOARD_Y - 3, 
            this.BOARD_WIDTH * this.BLOCK_SIZE + 6, 
            this.BOARD_HEIGHT * this.BLOCK_SIZE + 6
        );
        
        // Recreate all UI elements with new positions
        this.createUI();
        
        // Update service displays
        this.updateServiceDisplays();
        
        // Update score display
        this.updateUI();

        // Re-render the game
        this.render();
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

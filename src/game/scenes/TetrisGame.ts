import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

// Tetris piece shapes
const TETRIS_PIECES = {
    I: [
        [1, 1, 1, 1]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1]
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1]
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1]
    ]
};

const PIECE_COLORS = {
    I: 0x00FFFF, // Cyan
    O: 0xFFFF00, // Yellow
    T: 0x800080, // Purple
    S: 0x00FF00, // Green
    Z: 0xFF0000, // Red
    J: 0x0000FF, // Blue
    L: 0xFFA500  // Orange
};

interface TetrisPiece {
    shape: number[][];
    x: number;
    y: number;
    type: keyof typeof TETRIS_PIECES;
    color: number;
}

export class TetrisGame extends Scene {
    private board: number[][];
    private currentPiece: TetrisPiece | null = null;
    private nextPiece: TetrisPiece | null = null;
    private score: number = 0;
    private level: number = 1;
    private lines: number = 0;
    private dropTime: number = 0;
    private dropInterval: number = 1000; // milliseconds
    private gameOver: boolean = false;
    private isPaused: boolean = false;
    
    // Display elements
    private boardGraphics!: Phaser.GameObjects.Graphics;
    private scoreText!: Phaser.GameObjects.Text;
    private levelText!: Phaser.GameObjects.Text;
    private linesText!: Phaser.GameObjects.Text;
    private nextPieceGraphics!: Phaser.GameObjects.Graphics;
    private gameOverText!: Phaser.GameObjects.Text;
    private pauseText!: Phaser.GameObjects.Text;
    
    // Game constants
    private readonly BOARD_WIDTH = 10;
    private readonly BOARD_HEIGHT = 20;
    private readonly BLOCK_SIZE = 30;
    private readonly BOARD_X = 50;
    private readonly BOARD_Y = 50;

    constructor() {
        super('TetrisGame');
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
        
        // Draw board border
        this.boardGraphics.lineStyle(2, 0xFFFFFF);
        this.boardGraphics.strokeRect(
            this.BOARD_X - 2, 
            this.BOARD_Y - 2, 
            this.BOARD_WIDTH * this.BLOCK_SIZE + 4, 
            this.BOARD_HEIGHT * this.BLOCK_SIZE + 4
        );
    }

    private createUI() {
        const uiX = this.BOARD_X + this.BOARD_WIDTH * this.BLOCK_SIZE + 50;
        
        // Score display
        this.add.text(uiX, 50, 'SCORE', { 
            fontSize: '24px', 
            color: '#FFFFFF',
            fontFamily: 'Arial'
        });
        this.scoreText = this.add.text(uiX, 80, '0', { 
            fontSize: '32px', 
            color: '#FFFF00',
            fontFamily: 'Arial'
        });

        // Level display
        this.add.text(uiX, 140, 'LEVEL', { 
            fontSize: '24px', 
            color: '#FFFFFF',
            fontFamily: 'Arial'
        });
        this.levelText = this.add.text(uiX, 170, '1', { 
            fontSize: '32px', 
            color: '#00FF00',
            fontFamily: 'Arial'
        });

        // Lines display
        this.add.text(uiX, 230, 'LINES', { 
            fontSize: '24px', 
            color: '#FFFFFF',
            fontFamily: 'Arial'
        });
        this.linesText = this.add.text(uiX, 260, '0', { 
            fontSize: '32px', 
            color: '#00FFFF',
            fontFamily: 'Arial'
        });

        // Next piece display
        this.add.text(uiX, 320, 'NEXT', { 
            fontSize: '24px', 
            color: '#FFFFFF',
            fontFamily: 'Arial'
        });

        // Controls
        this.add.text(uiX, 450, 'CONTROLS:', { 
            fontSize: '18px', 
            color: '#FFFFFF',
            fontFamily: 'Arial'
        });
        this.add.text(uiX, 480, '← → Move', { 
            fontSize: '14px', 
            color: '#CCCCCC',
            fontFamily: 'Arial'
        });
        this.add.text(uiX, 500, '↓ Soft Drop', { 
            fontSize: '14px', 
            color: '#CCCCCC',
            fontFamily: 'Arial'
        });
        this.add.text(uiX, 520, '↑ Rotate', { 
            fontSize: '14px', 
            color: '#CCCCCC',
            fontFamily: 'Arial'
        });
        this.add.text(uiX, 540, 'SPACE Hard Drop', { 
            fontSize: '14px', 
            color: '#CCCCCC',
            fontFamily: 'Arial'
        });
        this.add.text(uiX, 560, 'P Pause', { 
            fontSize: '14px', 
            color: '#CCCCCC',
            fontFamily: 'Arial'
        });

        // Game over text (hidden initially)
        this.gameOverText = this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY, 
            'GAME OVER\nPress R to Restart', 
            { 
                fontSize: '48px', 
                color: '#FF0000',
                fontFamily: 'Arial',
                align: 'center'
            }
        ).setOrigin(0.5).setVisible(false);

        // Pause text (hidden initially)
        this.pauseText = this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY, 
            'PAUSED\nPress P to Resume', 
            { 
                fontSize: '48px', 
                color: '#FFFF00',
                fontFamily: 'Arial',
                align: 'center'
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

        // Check for game over
        if (this.isCollision(this.currentPiece, 0, 0)) {
            this.endGame();
        }
    }

    private createRandomPiece(): TetrisPiece {
        const pieces = Object.keys(TETRIS_PIECES) as (keyof typeof TETRIS_PIECES)[];
        const randomType = pieces[Math.floor(Math.random() * pieces.length)];
        
        return {
            shape: TETRIS_PIECES[randomType],
            x: 0,
            y: 0,
            type: randomType,
            color: PIECE_COLORS[randomType]
        };
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

    private isCollision(piece: TetrisPiece, dx: number, dy: number): boolean {
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
            
            // Scoring system
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
        
        // Draw board border
        this.boardGraphics.lineStyle(2, 0xFFFFFF);
        this.boardGraphics.strokeRect(
            this.BOARD_X - 2, 
            this.BOARD_Y - 2, 
            this.BOARD_WIDTH * this.BLOCK_SIZE + 4, 
            this.BOARD_HEIGHT * this.BLOCK_SIZE + 4
        );

        // Draw placed pieces
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    this.drawBlock(
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
                        this.drawBlock(
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
            const previewY = 350;
            
            for (let y = 0; y < this.nextPiece.shape.length; y++) {
                for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                    if (this.nextPiece.shape[y][x]) {
                        this.drawBlock(
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

    private drawBlock(graphics: Phaser.GameObjects.Graphics, x: number, y: number, color: number, scale: number = 1) {
        const size = this.BLOCK_SIZE * scale;
        
        graphics.fillStyle(color);
        graphics.fillRect(x, y, size, size);
        
        graphics.lineStyle(1, 0x000000);
        graphics.strokeRect(x, y, size, size);
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

import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    tetrisButton: GameObjects.Text;
    originalGameButton: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 200, 'logo').setDepth(100);

        this.title = this.add.text(512, 320, 'Game Selection', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Tetris Game Button
        this.tetrisButton = this.add.text(512, 420, '🧩 Play Tetris', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#00ff00',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.tetrisButton.setInteractive({ useHandCursor: true });
        this.tetrisButton.on('pointerdown', () => this.startTetris());
        this.tetrisButton.on('pointerover', () => {
            this.tetrisButton.setScale(1.1);
            this.tetrisButton.setColor('#ffff00');
        });
        this.tetrisButton.on('pointerout', () => {
            this.tetrisButton.setScale(1);
            this.tetrisButton.setColor('#00ff00');
        });

        // Original Game Button
        this.originalGameButton = this.add.text(512, 500, '⭐ Original Demo', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.originalGameButton.setInteractive({ useHandCursor: true });
        this.originalGameButton.on('pointerdown', () => this.changeScene());
        this.originalGameButton.on('pointerover', () => {
            this.originalGameButton.setScale(1.1);
            this.originalGameButton.setColor('#ffff00');
        });
        this.originalGameButton.on('pointerout', () => {
            this.originalGameButton.setScale(1);
            this.originalGameButton.setColor('#ffffff');
        });

        // Instructions
        this.add.text(512, 600, 'Click on a game to start playing!', {
            fontFamily: 'Arial', fontSize: 18, color: '#cccccc',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        EventBus.emit('current-scene-ready', this);
    }
    
    startTetris ()
    {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start('TetrisGame');
    }

    changeScene ()
    {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start('Game');
    }

    moveLogo (reactCallback: ({ x, y }: { x: number, y: number }) => void)
    {
        if (this.logoTween)
        {
            if (this.logoTween.isPlaying())
            {
                this.logoTween.pause();
            }
            else
            {
                this.logoTween.play();
            }
        } 
        else
        {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (reactCallback)
                    {
                        reactCallback({
                            x: Math.floor(this.logo.x),
                            y: Math.floor(this.logo.y)
                        });
                    }
                }
            });
        }
    }
}

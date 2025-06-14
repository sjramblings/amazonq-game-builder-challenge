import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    awsTetricsButton: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 200, 'logo').setDepth(100);

        this.title = this.add.text(512, 320, '☁️ AWS TETRICS ☁️', {
            fontFamily: 'Arial Black', fontSize: 48, color: '#FF9900',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // AWS Tetrics Game Button (Main and only option)
        this.awsTetricsButton = this.add.text(512, 420, '🚀 START GAME 🚀', {
            fontFamily: 'Arial Black', fontSize: 40, color: '#FF9900',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.awsTetricsButton.setInteractive({ useHandCursor: true });
        this.awsTetricsButton.on('pointerdown', () => this.startAWSTetrics());
        this.awsTetricsButton.on('pointerover', () => {
            this.awsTetricsButton.setScale(1.1);
            this.awsTetricsButton.setColor('#FFFF00');
        });
        this.awsTetricsButton.on('pointerout', () => {
            this.awsTetricsButton.setScale(1);
            this.awsTetricsButton.setColor('#FF9900');
        });

        // Instructions
        this.add.text(512, 520, 'AWS Community Competition Entry', {
            fontFamily: 'Arial', fontSize: 20, color: '#FF9900',
            align: 'center',
            fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(100);

        this.add.text(512, 550, 'Build your cloud infrastructure with AWS services!', {
            fontFamily: 'Arial', fontSize: 16, color: '#cccccc',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.add.text(512, 580, 'Click START GAME to begin your AWS journey!', {
            fontFamily: 'Arial', fontSize: 16, color: '#cccccc',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        EventBus.emit('current-scene-ready', this);
    }
    
    startAWSTetrics ()
    {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start('AWSTetricsGame');
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

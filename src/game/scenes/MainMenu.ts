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
        this.createElements();
        EventBus.emit('current-scene-ready', this);
    }

    createElements()
    {
        this.background = this.add.image(0, 0, 'background')
            .setOrigin(0, 0)
            .setDisplaySize(this.scale.width, this.scale.height);

        this.logo = this.add.image(this.getLogoX(), this.getLogoY(), 'logo').setDepth(100);
        this.resizeLogo();

        this.title = this.add.text(this.getTitleX(), this.getTitleY(), '☁️ AWS TETRICS ☁️', {
            fontFamily: 'Arial Black', 
            fontSize: this.getTitleFontSize() + 'px', 
            color: '#FF9900',
            stroke: '#000000', 
            strokeThickness: this.getTitleStrokeThickness(),
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // AWS Tetrics Game Button (Main and only option)
        this.awsTetricsButton = this.add.text(this.getButtonX(), this.getButtonY(), '🚀 START GAME 🚀', {
            fontFamily: 'Arial Black', 
            fontSize: this.getButtonFontSize() + 'px', 
            color: '#FF9900',
            stroke: '#000000', 
            strokeThickness: this.getButtonStrokeThickness(),
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
        this.add.text(this.getSubtitleX(), this.getSubtitle1Y(), 'AWS Community Competition Entry', {
            fontFamily: 'Arial', 
            fontSize: this.getSubtitleFontSize() + 'px', 
            color: '#FF9900',
            align: 'center',
            fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(100);

        this.add.text(this.getSubtitleX(), this.getSubtitle2Y(), 'Build your cloud infrastructure with AWS services!', {
            fontFamily: 'Arial', 
            fontSize: this.getDescriptionFontSize() + 'px', 
            color: '#cccccc',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.add.text(this.getSubtitleX(), this.getSubtitle3Y(), 'Click START GAME to begin your AWS journey!', {
            fontFamily: 'Arial', 
            fontSize: this.getDescriptionFontSize() + 'px', 
            color: '#cccccc',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
    }

    // Responsive positioning methods
    getScaleX() {
        return this.scale.width / 1024; // Base width
    }

    getScaleY() {
        return this.scale.height / 768; // Base height
    }

    getScale() {
        return Math.min(this.getScaleX(), this.getScaleY());
    }

    getLogoX() {
        return this.scale.width / 2;
    }

    getLogoY() {
        return Math.max(this.scale.height * 0.2, 120);
    }

    resizeLogo() {
        if (this.logo) {
            const scale = Phaser.Math.Clamp(this.getScale(), 0.5, 1.2);
            this.logo.setScale(scale);
        }
    }

    getTitleX() {
        return this.scale.width / 2;
    }

    getTitleY() {
        return this.getLogoY() + Math.max(this.scale.height * 0.15, 100);
    }

    getTitleFontSize() {
        let fontSize = 48 * this.getScale();
        return Phaser.Math.Clamp(fontSize, 24, 60);
    }

    getTitleStrokeThickness() {
        let thickness = 8 * this.getScale();
        return Phaser.Math.Clamp(thickness, 4, 10);
    }

    getButtonX() {
        return this.scale.width / 2;
    }

    getButtonY() {
        return this.getTitleY() + Math.max(this.scale.height * 0.12, 80);
    }

    getButtonFontSize() {
        let fontSize = 40 * this.getScale();
        return Phaser.Math.Clamp(fontSize, 20, 50);
    }

    getButtonStrokeThickness() {
        let thickness = 6 * this.getScale();
        return Phaser.Math.Clamp(thickness, 3, 8);
    }

    getSubtitleX() {
        return this.scale.width / 2;
    }

    getSubtitle1Y() {
        return this.getButtonY() + Math.max(this.scale.height * 0.1, 60);
    }

    getSubtitle2Y() {
        return this.getSubtitle1Y() + Math.max(this.scale.height * 0.04, 25);
    }

    getSubtitle3Y() {
        return this.getSubtitle2Y() + Math.max(this.scale.height * 0.04, 25);
    }

    getSubtitleFontSize() {
        let fontSize = 20 * this.getScale();
        return Phaser.Math.Clamp(fontSize, 12, 24);
    }

    getDescriptionFontSize() {
        let fontSize = 16 * this.getScale();
        return Phaser.Math.Clamp(fontSize, 10, 20);
    }

    // Resize method called when screen size changes
    resize() {
        // Update background
        this.background.setDisplaySize(this.scale.width, this.scale.height);

        // Update logo
        this.logo.setPosition(this.getLogoX(), this.getLogoY());
        this.resizeLogo();

        // Update title
        this.title.setPosition(this.getTitleX(), this.getTitleY());
        this.title.setFontSize(this.getTitleFontSize());
        this.title.setStroke('#000000', this.getTitleStrokeThickness());

        // Update button
        this.awsTetricsButton.setPosition(this.getButtonX(), this.getButtonY());
        this.awsTetricsButton.setFontSize(this.getButtonFontSize());
        this.awsTetricsButton.setStroke('#000000', this.getButtonStrokeThickness());

        // Update all text elements
        const textElements = this.children.list.filter(child => child instanceof Phaser.GameObjects.Text);
        textElements.forEach((text, index) => {
            if (text === this.title || text === this.awsTetricsButton) return;
            
            const textObj = text as Phaser.GameObjects.Text;
            switch(index - 2) { // Adjust for title and button
                case 0:
                    textObj.setPosition(this.getSubtitleX(), this.getSubtitle1Y());
                    textObj.setFontSize(this.getSubtitleFontSize());
                    break;
                case 1:
                    textObj.setPosition(this.getSubtitleX(), this.getSubtitle2Y());
                    textObj.setFontSize(this.getDescriptionFontSize());
                    break;
                case 2:
                    textObj.setPosition(this.getSubtitleX(), this.getSubtitle3Y());
                    textObj.setFontSize(this.getDescriptionFontSize());
                    break;
            }
        });
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
                x: { value: this.scale.width * 0.75, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: this.scale.height * 0.1, duration: 1500, ease: 'Sine.easeOut' },
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

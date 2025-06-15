import { Boot } from './scenes/Boot';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { AWSTetricsGame } from './scenes/AWSTetricsGame';

//  Responsive game configuration following best practices
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    dom: {
        createContainer: true
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        AWSTetricsGame
    ]
};

const StartGame = (parent: string) => {
    const game = new Game({ ...config, parent });
    
    // Add responsive event listeners
    const onChangeScreen = () => {
        game.scale.resize(window.innerWidth, window.innerHeight);
        
        // Get the current active scene
        const currentScene = game.scene.getScenes(true)[0];
        
        // Call resize method if it exists on the current scene
        if (currentScene && typeof (currentScene as any).resize === 'function') {
            (currentScene as any).resize();
        }
    };

    // Handle orientation changes
    const orientation = screen.orientation || (screen as any).mozOrientation || (screen as any).msOrientation;
    if (orientation) {
        orientation.addEventListener('change', () => {
            setTimeout(onChangeScreen, 100); // Small delay for orientation change
        });
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        onChangeScreen();
    });

    return game;
}

export default StartGame;

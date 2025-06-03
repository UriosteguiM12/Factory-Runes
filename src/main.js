// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    transparent: true,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {
                x: 0,
                y: 0
            },
            fps: 120,           
            fixedStep: true 
        }
    },
    width: 900,
    height: 1075,
    scene: [Load, Controls, Credits, LevelOne, TitleScreen],
    scale: {
        mode: Phaser.Scale.FIT,        
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
}

const game = new Phaser.Game(config);
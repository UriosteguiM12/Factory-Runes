class Load extends Phaser.Scene {
    constructor() {
        super("Load");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load tilemap information
        this.load.image("monochrome_tilemap", "monochrome_tilemap_packed.png");
        this.load.image("monochrome_tilemap_transparent", "monochrome_tilemap_transparent_packed.png");    
        
        // Packed tilemap
        this.load.tilemapTiledJSON("level-one", "final_game.tmj");   // Tilemap in JSON
    }

    create() {
        /*
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });
        */

         // ...and pass to the next Scene
         this.scene.start("TitleScreen");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}
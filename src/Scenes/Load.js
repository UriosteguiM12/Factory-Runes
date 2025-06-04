class Load extends Phaser.Scene {
    constructor() {
        super("Load");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load tilemap information
        this.load.image("monochrome_tilemap", "monochrome_tilemap_packed.png");
        this.load.image("monochrome_tilemap_transparent", "monochrome_tilemap_transparent_packed.png"); 
        
        this.load.spritesheet('characters', 'monochrome_tilemap_transparent_packed2.png', {
            frameWidth: 16,  
            frameHeight: 16
        });
        
        // Packed tilemap
        this.load.tilemapTiledJSON("level-one", "final_game.tmj");   // Tilemap in JSON

    }

    create() {
    
        this.anims.create({
            key: 'walk',
            frames: [
                {key: 'characters', frame: 261},
                {key: 'characters', frame: 262},
                {key: 'characters', frame: 263},
                {key: 'characters', frame: 264}
            ],
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            frames: [
                {key: 'characters', frame: 260},
                {key: 'characters', frame: 266}
            ],
            frameRate: 1,
            repeat: -1
        });

        this.anims.create({
            key: 'shellWalking',
            frames: [
                {key: 'characters', frame: 360},
                {key: 'characters', frame: 361},
                {key: 'characters', frame: 362},
                {key: 'characters', frame: 363},
                {key: 'characters', frame: 364},
            ],
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'shellDie',
            frames: [
                {key: 'characters', frame: 366},
                {key: 'characters', frame: 1}
            ],
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'flyingIdle',
            frames: [
                {key: 'characters', frame: 380},
                {key: 'characters', frame: 381}
            ],
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'flyingDie',
            frames: [
                {key: 'characters', frame: 380},
                {key: 'characters', frame: 1},
                {key: 'characters', frame: 381},
                {key: 'characters', frame: 1}
            ],
            frameRate: 8,
            repeat: -1
        });

         // ...and pass to the next Scene
         this.scene.start("TitleScreen");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}
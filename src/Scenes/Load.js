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
                {key: 'characters', frame: 209},
                {key: 'characters', frame: 210},
                {key: 'characters', frame: 211},
                {key: 'characters', frame: 212}
            ],
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            frames: [
                {key: 'characters', frame: 208},
                {key: 'characters', frame: 213}
            ],
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: [
                {key: 'characters', frame: 214}
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
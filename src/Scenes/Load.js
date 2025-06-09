class Load extends Phaser.Scene {
    constructor() {
        super("Load");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load tilemap information
        this.load.image("monochrome_tilemap", "monochrome_tilemap_packed.png");
        this.load.image("monochrome_tilemap_transparent", "monochrome_tilemap_transparent_packed.png");

        //load images
        this.load.image("coin_particle", "coin_particle.png");
        this.load.image('key', 'tile_0096.png'); 
        this.load.image('idle_1', 'idle_1.png'); 
        this.load.image('idle_2', 'idle_2.png'); 
        
        this.load.spritesheet('characters', 'monochrome_tilemap_transparent_packed.png', {
            frameWidth: 16,  
            frameHeight: 16
        });
        
        // Packed tilemap
        this.load.tilemapTiledJSON("level-one", "final_game.json");   // Tilemap in JSON

        // Load audio
        this.load.audio("coinCollect", "coin_collect.mp3");
        this.load.audio("keyCollect", "key_collect.mp3");
        this.load.audio("jump", "jump.mp3");
        this.load.audio("shoot", "laser.mp3");
        this.load.audio("hurt", "take_damage.mp3");
        this.load.audio("heal", "health_up.ogg");
        this.load.audio("enemyHurt", "enemy_damage.mp3");
        this.load.audio("enemyDeath", "enemy_death.mp3");
        this.load.audio("keyDrop", "key_drop.mp3");
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
                {key: 'characters', frame: 280}
            ],
            frameRate: 1,
            repeat: -1
        });

        this.anims.create({
            key: 'hurt',
            frames: [
                {key: 'characters', frame: 0},
                {key: 'characters', frame: 260}
            ],
            frameRate: 10,
            repeat: 25
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
                {key: 'characters', frame: 0}
            ],
            frameRate: 8,
            repeat: 8
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
                {key: 'characters', frame: 0}
            ],
            frameRate: 8,
            repeat: 8
        });

         // ...and pass to the next Scene
         this.scene.start("TitleScreen");
    }
}
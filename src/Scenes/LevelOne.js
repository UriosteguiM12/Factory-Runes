class LevelOne extends Phaser.Scene{

    constructor() {
        super("LevelOne");
    }

    init() {
        this.ACCELERATION = 500;
        this.MAX_VELOCITY = 512;
        this.DRAG = 2000;
        this.JUMP_VELOCITY = -550;
        this.physics.world.gravity.y = 1600;
    }

    preload() {

    }

    create() {
        console.log("loaded the Level!");

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys("W,S,A,D");

        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("level-one", 16, 16, 80, 120);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        const oneBit = this.map.addTilesetImage("1-bit-tileset", "monochrome_tilemap");
        const oneBitTransparent = this.map.addTilesetImage("1-bit-transparent", "monochrome_tilemap_transparent");
        const tilesets = [oneBit, oneBitTransparent];

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", tilesets, 0, -3000);
        this.groundLayer.setScale(2.0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        // set up player avatar
        this.player = this.physics.add.sprite(160, 400, "characters", 260);
        this.player.setCollideWorldBounds(true);
        this.player.setScale(2.0);
        this.player.setOrigin(0, 0);

        // Enable collision handling
        this.physics.add.collider(this.player, this.groundLayer);


    }

    update() {

        // player movement
        if (this.cursors.left.isDown || this.keys.A.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown || this.keys.D.isDown) {
            this.player.setVelocityX(160);
        } else {
            this.player.setVelocityX(0);
        }

        if ((this.cursors.up.isDown || this.keys.W.isDown) && this.player.body.blocked.down) {
            this.player.setVelocityY(-300);
        }
        
    }

}
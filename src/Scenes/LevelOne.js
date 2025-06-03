class LevelOne extends Phaser.Scene{

    constructor() {
        super("LevelOne");
    }

    init() {
        this.ACCELERATION = 500;
        this.MAX_VELOCITY = 512;
        this.DRAG = 2000;
        this.JUMP_VELOCITY = -750;
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
        this.player.setScale(2.5);
        this.player.setOrigin(0, 0);

        // Enable collision handling
        this.physics.add.collider(this.player, this.groundLayer);

        // camera code
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.25, 0.25, 100, 0); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(2.0);
        this.cameras.main.followOffset.set(0, 150);
    }

    update() {

        // player movement
        if (this.cursors.left.isDown || this.keys.A.isDown) {
            this.player.setAccelerationX(-this.ACCELERATION);
            this.player.resetFlip();

        } else if (this.cursors.right.isDown || this.keys.D.isDown) {
            this.player.setAccelerationX(this.ACCELERATION);
            this.player.setFlip(true, false);

        } else {
            this.player.setAccelerationX(0);
        }

        if ((this.cursors.up.isDown || this.keys.W.isDown) && this.player.body.blocked.down) {
            this.player.setVelocityY(-300);
        }

        // Apply max speed
        if (Math.abs(this.player.body.velocity.x) > this.MAX_VELOCITY) {
            this.player.setVelocityX(Phaser.Math.Clamp(this.player.body.velocity.x, -this.MAX_VELOCITY, this.MAX_VELOCITY));
        }

        // Grounded drag
        if (this.player.body.blocked.down) {
            this.player.setDragX(this.DRAG);
        } else {
            this.player.setDragX(0);
        }

        // Gravity multiplier when falling
        if (!this.player.body.blocked.down && this.player.body.velocity.y > 0) {
            this.player.setGravityY(this.physics.world.gravity.y);
        } else {
            this.player.setGravityY(0);
        }

        // Jumping
        if (this.player.body.blocked.down && (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown('W'))) {
            this.player.setVelocityY(this.JUMP_VELOCITY);
        }
        
    }

}
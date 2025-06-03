class LevelOne extends Phaser.Scene{

    constructor() {
        super("LevelOne");
    }

    preload() {

    }

    create() {

        console.log("loaded the Level!");

        const tileWidth = 16;
        const tileHeight = 16;

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
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", tilesets, 0, 0);
        this.groundLayer.setScale(2.0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        // set up player avatar
        this.player = this.physics.add.sprite(100, 100, "characters", 260);
        this.player.setCollideWorldBounds(true);
        this.player.setScale(5.0);

        // Enable collision handling
        this.physics.add.collider(this.player, this.groundLayer);


    }

    update() {
        
    }

}

class LevelOne extends Phaser.Scene{

    constructor() {
        super("LevelOne");
    }

    init() {

        // modify values to modify player jump
        this.ACCELERATION = 1000;
        this.MAX_VELOCITY = 250;
        this.DRAG = 5000;
        this.JUMP_VELOCITY = -530;
        this.physics.world.gravity.y = 1000;
    }

    preload() {

        this.load.setPath("./assets/");

        this.load.image('key', 'tile_0096.png');

        // enemy animations
        this.load.image('shellIdle', 'tile_1365.png');
        this.load.image('shellEnemy', 'tile_1360.png')
        this.load.image('flyingEnemy', 'tile_0381.png')

        // gun related assets
        this.load.image('gun', 'tile_0261.png');
        this.load.image('playerGun', 'tile_1261.png');
        this.load.image('bullet', 'tile_0001.png');

        // counters
        this.load.image('heart', 'tile_0041.png')
        this.load.image('coin', 'tile_0002.png')

        // digits
        for (let i = 0; i <= 9; i++) {
            this.load.image(`digit_${i}`, `tile_016${i}.png`);
        }
        this.load.image('multiplier', 'tile_0158.png');
    }

    create() {
        console.log("loaded the Level!");

        // keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys("W,S,A,D");
        this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

        // Create a new tilemap game object which uses 16x16 pixel tiles, and is
        // 480 tiles wide and 120 tiles tall.
        this.map = this.add.tilemap("level-one", 16, 16, 80, 120);

        // Add a tileset to the map
        const oneBit = this.map.addTilesetImage("1-bit-tileset", "monochrome_tilemap");
        const oneBitTransparent = this.map.addTilesetImage("1-bit-transparent", "monochrome_tilemap_transparent");
        const tilesets = [oneBit, oneBitTransparent];

        // Create level layers
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", tilesets, 0, 0);
        this.groundLayer.setScale(2.0);
        this.groundLayer.setCollisionByProperty({ collides: true });


        // Create coins from objects in the map
        this.coins = this.map.createFromObjects("Coins", {
            name: "coin",
            key: "characters",
            frame: 2,
            scale: 2
        });

        // Add each coin sprite to the physics group
        this.coinGroup = this.physics.add.staticGroup();

        this.coins.forEach(coin => {
            coin.setScale(2);
            coin.setOrigin(0, 0);
            coin.x *= 2;
            coin.y *= 2;
            this.coinGroup.add(coin);
        });

        // player setup
        this.player = this.physics.add.sprite(160, 3500, "characters", 260);
        this.player.setCollideWorldBounds(true);
        this.player.setScale(2.0);
        this.player.setOrigin(0, 0);

        // for key randomization:
        // Pick 4 unique random indices between 1 and 19
        let remainingKeyIndices = Phaser.Utils.Array.NumberArray(1, 19);
        Phaser.Utils.Array.Shuffle(remainingKeyIndices);  // randomize order
        let keyIndices = remainingKeyIndices.slice(0, 4);  // pick first 4

        // enemy setup
        this.enemies = this.physics.add.group(); // this is going to contain all enemies, regardless of type
        const enemySpawns = [ { x: 200, y: 3500 },
                              { x: 300, y: 3475 },
                              { x: 200, y: 3500 },
                              { x: 300, y: 3475 },
                              { x: 200, y: 3500 },
                              { x: 300, y: 3475 },
                              { x: 200, y: 3500 },
                              { x: 300, y: 3475 },
                              { x: 200, y: 3500 },
                              { x: 300, y: 3475 },
                              { x: 200, y: 3500 },
                              { x: 300, y: 3475 },
                              { x: 200, y: 3500 },
                              { x: 300, y: 3475 },
                              { x: 200, y: 3500 },
                              { x: 300, y: 3475 },
                              { x: 200, y: 3500 },
                              { x: 300, y: 3475 },
         ];

        enemySpawns.forEach((spawnPoint, index) => {
            
            // make 10 shell enemies and 10 flying enemies which will be scattered across the map based on the spawn points
            let enemy = (index % 2 === 0)
            ? new ShellEnemy(this, spawnPoint.x, spawnPoint.y, 'shellEnemy', 50)
            : new FlyingEnemy(this, spawnPoint.x, spawnPoint.y, 'flyingEnemy', 50);

            // First enemy always has a key
            if (index === 0) {
                enemy.hasKey = true;
            }
            // Give key to 4 other random enemies
            else if (keyIndices.includes(index)) {
                enemy.hasKey = true;
            } else {
                enemy.hasKey = false;
            }

            enemy.setScale(2.0);
            this.enemies.add(enemy);
        });

        // collisions
        this.physics.add.collider(this.player, this.groundLayer);
        this.physics.add.collider(this.enemies, this.groundLayer);

        // gun setup
        this.gun = this.add.sprite(this.player.x + 25, this.player.y + 20, 'gun');
        this.gunActive = false;
        this.gun.setScale(2.5);
        this.gun.setVisible(false);
        this.gun.setOrigin(0.2, 0.5);
        this.gun.rotationSpeed = 0.03;
        this.gun.minAngle = Phaser.Math.DegToRad(-45);
        this.gun.maxAngle = Phaser.Math.DegToRad(45);
        this.gun.currentAngle = 0;
        this.gun.direction = 1;

        // bullets group
        this.bullets = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            maxSize: 3
        });

        this.physics.add.collider(this.bullets, this.groundLayer, (bullet, tile) => {
            bullet.disableBody(true, true);
        });

        this.lastFired = 0;
        this.fireRate = 150;

        this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
            bullet.disableBody(true, true);  // bullet disappears
            enemy.takeDamage();
        });

        // key collection
        this.keyGroup = this.physics.add.group();
        this.physics.add.collider(this.keyGroup, this.groundLayer);
        this.keysCollected = 0;

        this.physics.add.overlap(this.player, this.keyGroup, (player, key) => {
            key.destroy();
            this.keysCollected++;
            console.log('key has been collected!');

            // add a condition for when the player collects all 5 keys
        });

        // camera code
        this.cameras.main.setBounds(0, 0, 2570, 4000);
        this.physics.world.setBounds(0, 0, 2570, 4000);
        this.cameras.main.startFollow(this.player, true, 0.25, 0.25, 100, 0);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(2.0);
        this.cameras.main.followOffset.set(0, 100);

        // counters
        this.coinCount = 0;
        this.health = 5;

        // COIN UI
        this.coin = this.add.image(250, 300, 'coin').setScrollFactor(0).setScale(2);
        this.coinMultiplier = this.add.image(270, 303, 'multiplier').setScrollFactor(0).setScale(1);

        this.coinDigits = [];
        for (let i = 0; i < 2; i++) {
            let digit = this.add.image(290 + i * 24, 300, 'digit_0').setScrollFactor(0).setScale(2.0);
            this.coinDigits.push(digit);
        }

        // HEALTH UI
        this.heart = this.add.image(250, 340, 'heart').setScrollFactor(0).setScale(2);
        this.heartMultiplier = this.add.image(270, 343, 'multiplier').setScrollFactor(0).setScale(1);

        this.heartDigits = [];
        for (let i = 0; i < 1; i++) {
            let digit = this.add.image(290 + i * 24, 340, 'digit_5').setScrollFactor(0).setScale(2);
            this.heartDigits.push(digit);
        }

        // Handle collision detection with coins
        this.physics.add.overlap(this.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.sound.play("coinCollect", {
                    volume: 0.5
                });
            this.coinCount += 1;
            this.updateDigitImages(this.coinCount, this.coinDigits);
        })
    }

    update() {

        // have to put update for each class since Phaser doesn't do it automatically :/
        this.enemies.children.iterate(enemy => {
            if (enemy && enemy.update) {
                enemy.update();
            }
        });

        // First, handle movement
        if (this.cursors.left.isDown || this.keys.A.isDown) {
            this.player.setAccelerationX(-this.ACCELERATION);
            this.player.setFlip(true, false);
        } else if (this.cursors.right.isDown || this.keys.D.isDown) {
            this.player.setAccelerationX(this.ACCELERATION);
            this.player.resetFlip();
        } else {
            this.player.setAccelerationX(0);
        }

        // Apply max speed
        if (Math.abs(this.player.body.velocity.x) > this.MAX_VELOCITY) {
            this.player.setVelocityX(Phaser.Math.Clamp(this.player.body.velocity.x, -this.MAX_VELOCITY, this.MAX_VELOCITY));
        }

        // Grounded drag
        this.player.setDragX(this.player.body.blocked.down ? this.DRAG : 0);

        // Gravity
        this.player.setGravityY(!this.player.body.blocked.down && this.player.body.velocity.y > 0 ? this.physics.world.gravity.y : 0);

        // Handle jumping input
        if (this.player.body.blocked.down && (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keys.W))) {
            this.player.setVelocityY(this.JUMP_VELOCITY);
            this.sound.play("jump", {
                    volume: 0.5,
                    rate: Phaser.Math.FloatBetween(0.95, 1.15)
                });
        }

        // JUMP FRAME CONTROL
        if ((!this.player.body.blocked.down) && (!this.gunActive)) {
            // In air
            if (this.player.body.velocity.x > 10) {
                // Jumping right
                this.player.setFrame(264);
                this.player.resetFlip(); // facing right
            } else if (this.player.body.velocity.x < -10) {
                // Jumping left
                this.player.setFrame(264);
                this.player.setFlip(true, false); // facing left
            } else {
                // Jumping straight up
                this.player.setFrame(265);
            }
        } else {
            // On ground - play walk/idle animations
            if (this.player.body.velocity.x !== 0) {
                this.player.anims.play('walk', true);
            } else {
                this.player.anims.play('idle', true);
            }
        }

        // If Q is just pressed, enable the gun and reset angle/direction
        if (Phaser.Input.Keyboard.JustDown(this.keyQ)) {
            this.gunActive = true;
            this.gun.currentAngle = 0;
            this.gun.direction = 1;
            this.gun.setVisible(true);
        }

        // If gun is active, keep rotating it
        if (this.gunActive) {
            this.player.setTexture('playerGun');

            // Update gun position and flip based on direction
            if (this.player.flipX) {
                this.gun.setOrigin(0.8, 0.5);
                this.gun.setFlipX(true);
                this.gun.x = this.player.x + 10;
            } else {
                this.gun.setOrigin(0.2, 0.5);
                this.gun.setFlipX(false);
                this.gun.x = this.player.x + 25;
            }
            this.gun.y = this.player.y + 20;

            // Rotate the gun
            this.gun.currentAngle += this.gun.rotationSpeed * this.gun.direction;
            if (this.gun.currentAngle >= this.gun.maxAngle || this.gun.currentAngle <= this.gun.minAngle) {
                this.gun.direction *= -1;
            }
            this.gun.rotation = this.gun.currentAngle;
        }

        if (Phaser.Input.Keyboard.JustUp(this.keyQ)) {
            this.gunActive = false;
            this.gun.setVisible(false);
        }

        const isShooting = this.keyE.isDown;
        const now = this.time.now;

        if (this.gunActive && isShooting && now - this.lastFired > this.fireRate) {
            this.fireBullet();
            this.lastFired = now;
            this.sound.play("shoot", {
                volume: 0.5
            });
        }

        // OPTIMIZATION: set enemies invisible if they're not close to the player -> lags otherwise
        const cam = this.cameras.main;

        this.enemies.children.iterate(enemy => {
            if (!enemy) return;

            if (!Phaser.Geom.Intersects.RectangleToRectangle(cam.worldView, enemy.getBounds())) {
                enemy.body.enable = false;
                enemy.setVisible(false);
            } else {
                enemy.body.enable = true;
                enemy.setVisible(true);
            }
        });      
    }

    fireBullet() {
        const bullet = this.bullets.get();

        if (!bullet) {
            console.warn("No bullets available in pool!");
            return;
        }

        bullet.setTexture('bullet');

        // Gun rotation is relative to the player's direction
        let angle = this.gun.rotation;

        // Adjust angle if the player is facing left
        if (this.player.flipX) {
            angle = Phaser.Math.Angle.Reverse(angle); // flip across vertical axis
        }

        const offset = 25;
        const startX = this.gun.x + Math.cos(angle) * offset;
        const startY = this.gun.y + Math.sin(angle) * offset;

        bullet.enableBody(true, startX, startY, true, true);
        bullet.setAngle(Phaser.Math.RadToDeg(angle));
        bullet.setGravityY(0);

        const speed = 400;
        bullet.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );

        bullet.setCollideWorldBounds(true);
        bullet.body.onWorldBounds = true;

        bullet.once('worldbounds', () => {
            bullet.disableBody(true, true);
        });

        bullet.setVisible(true);
        bullet.setActive(true);
    }

    updateDigitImages(value, imageArray) {
        const str = value.toString().padStart(imageArray.length, '0');
        for (let i = 0; i < imageArray.length; i++) {
            imageArray[i].setTexture(`digit_${str[i]}`);
        }
    }
}
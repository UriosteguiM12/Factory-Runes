class LevelOne extends Phaser.Scene{

    constructor() {
        super("LevelOne");
    }

    init() {

        // modify values to modify player jump
        this.ACCELERATION = 1000;
        this.MAX_VELOCITY = 250;
        this.DRAG = 5000;
        this.AIR_DRAG = 5000;
        this.JUMP_VELOCITY = -530;
        this.physics.world.gravity.y = 1000;

        // turn off debug
        this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true;

        // counters
        this.coinCount = 0;
        this.health = 3;
        this.keysCollected = 0;
        this.enemiesKilled = 0;
        this.playerAlive = true;
        this.gameOver = false

        // stores locks that will be unlocked once player gets near
        this.pendingUnlocks = [];
    }

    preload() {

        this.load.setPath("./assets/");

        //loading animatedTiles plugin
        //this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');

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
        this.load.image('key', 'tile_0096.png')
    }

    create() {
        console.log("loaded the Level!");

        // keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys("W,S,A,D");
        this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Flag to disable player input
        this.inputEnabled = true;

        // Create a new tilemap game object which uses 16x16 pixel tiles, and is
        // 480 tiles wide and 120 tiles tall.
        this.map = this.add.tilemap("level-one", 16, 16, 80, 120);

        // Add a tileset to the map
        const oneBit = this.map.addTilesetImage("1-bit-tileset", "monochrome_tilemap");
        const oneBitTransparent = this.map.addTilesetImage("1-bit-transparent", "monochrome_tilemap_transparent");
        const tilesets = [oneBit, oneBitTransparent];

        // Create level layers
        this.bgLayer = this.map.createLayer("Background", tilesets, 0, 0);
        this.bgLayer.setScale(2.0);
        this.bgLayer.setCollisionByProperty({ collides: false });
        this.bgLayer.alpha = 0.35;

        this.groundLayer = this.map.createLayer("Ground-n-Platforms", tilesets, 0, 0);
        this.groundLayer.setScale(2.0);
        this.groundLayer.setCollisionByProperty({ collides: true });
        this.groundLayer.alpha = 1.0;

        this.foregroundLayer = this.map.createLayer("Foreground", tilesets, 0, 0);
        this.foregroundLayer.setScale(2.0);
        this.foregroundLayer.setCollisionByProperty({ collides: true });
        this.foregroundLayer.alpha = 1.0;


        // Add each coin/spike/lock sprite to the physics group
        this.lockGroup = this.physics.add.staticGroup();
        this.spikeGroup = this.physics.add.staticGroup();
        this.coinGroup = this.physics.add.staticGroup();
        this.doorGroup = this.physics.add.staticGroup();

        const doorObject = this.map.getObjectLayer('Exit').objects;
        doorObject.forEach(obj => {

            // get the "frameInt" property from Tiled
            let frameInt = obj.properties?.find(p => p.name === 'FrameInt')?.value ?? 56;

            // set characteristics
            const door = this.doorGroup.create(
                obj.x * 2,
                obj.y * 2,
                'characters',       
                frameInt           
            );

            door.setOrigin(0, 1);
            door.setScale(2.0);
            door.alpha = 1.0;

            // door collision box
            let bodyX = 32;
            let bodyY = 32;
            let offsetX = 8;
            let offsetY = -24;

            door.body.setSize(bodyX, bodyY);
            door.body.setOffset(offsetX, offsetY);
            this.doorGroup.add(door);
        });

        this.lockArray = [];
        const lockObjects = this.map.getObjectLayer('Gate').objects;
        // for each lock object
        lockObjects.forEach(obj => {

            // get the "frameInt" property from Tiled
            let frameInt = obj.properties?.find(p => p.name === 'FrameInt')?.value ?? 47;

            // set characteristics
            const lock = this.lockGroup.create(
                obj.x * 2,
                obj.y * 2,
                'monochrome_tilemap_spritesheet',       
                frameInt           
            );

            lock.setOrigin(0, 1);
            lock.setScale(2.0);
            lock.alpha = 1.0;

            // Lock collision box
            let bodyX = 32;
            let bodyY = 32;
            let offsetX = 8;
            let offsetY = -24;

            lock.body.setSize(bodyX, bodyY);
            lock.body.setOffset(offsetX, offsetY);
            this.lockGroup.add(lock);

            this.lockArray.push(lock);
        });


        const spikeObjects = this.map.getObjectLayer('Spikes').objects;
        // for each spike object
        spikeObjects.forEach(obj => {

            // get the "frameInt" property from Tiled
            const frameInt = obj.properties?.find(p => p.name === 'FrameInt')?.value ?? 183;

            // set characteristics
            const spike = this.spikeGroup.create(
                obj.x * 2,
                obj.y * 2,
                'characters',       
                frameInt           
            );

            spike.setOrigin(0, 1);
            spike.setScale(2.0);
            spike.alpha = 1.0;
            spike.angle = obj.rotation;

            // set the object to be flipped horizontal/vertical to match how the map looks in Tiled
            spike.flipX = obj.flippedHorizontal || false;
            spike.flipY = obj.flippedVertical || false;

            // manually fix collision boxes based off of horizontal/vertical flips (ughhhhhhhh)

            // default spike collision box (FrameInt: 183, No Vertical, No Horizontal, Rotation 0)
            let bodyX = 32;
            let bodyY = 16;
            let offsetX = 8;
            let offsetY = -10;

            // if FrameInt = 183 (normal Spike)
            if (frameInt === 183) {

                // Yes Vertical, Yes Horizontal
                if (obj.flippedVertical && obj.flippedHorizontal) offsetX = 20, offsetY = 8, bodyX = 16, bodyY = 32;
                
                // No Vertical, Yes Horizontal
                if (!obj.flippedVertical && obj.flippedHorizontal){
                    // Rotation 180
                    if (obj.rotation === 180) offsetX = -24, offsetY = 10;
                    // Rotation 90
                    else offsetX = 10, offsetY = 8, bodyX = 16, bodyY = 32;
                }
                // No Vertical, No Horizontal, Rotation -90
                if (!obj.flippedVertical && !obj.flippedHorizontal && obj.rotation === -90) bodyX = 16, bodyY = 32, offsetX = -10, offsetY = -24;
                
                // Yes Vertical, No Horizontal
                if (obj.flippedVertical && !obj.flippedHorizontal) {
                    // Rotation -90
                    if (obj.rotation === -90) bodyX = 16, bodyY = 32, offsetX = -20, offsetY = -24;
                    // Rotation 0
                    else offsetX = 8, offsetY = -20;
                }
            }

            if (frameInt === 166) {
                if (obj.flippedVertical && obj.flippedHorizontal && obj.rotation === 0) bodyY = 25, offsetY = -14;
                else bodyX = 25, bodyY = 32, offsetY = 8;
            }

            spike.body.setSize(bodyX, bodyY);
            spike.body.setOffset(offsetX, offsetY);
            this.spikeGroup.add(spike);

        });

        // Create coins from objects in the map
        this.coins = this.map.createFromObjects("Coins", {
            name: "coin",
            key: "characters",
            frame: 2,
            scale: 2
        });

        let coinounter = 0;
        this.coins.forEach(coin => {
            coinounter++;
            coin.setScale(2.0);
            coin.setOrigin(0.5, 0.5);
            coin.x *= 2;
            coin.y *= 2;
            coin.alpha = 1.0;
            this.coinGroup.add(coin);
        });

        console.log(coinounter);

        // vfx for collecting coins
        this.coinCollectParticles = this.add.particles(0, 0, "coin_particle", {
            quantity: 10,
            lifespan: 600,
            speed: { min: 50, max: 100 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.0, end: 0.0 },
            alpha: { start: 1, end: 0 },
            gravityY: -100,
            emitting: false // only triggered manually with explode 
        });

        // COIN UI
        this.coin = this.add.image(250, 300, 'coin').setScrollFactor(0).setScale(2);
        this.coinScore = this.add.text(this.cameras.main.centerX - 150, this.cameras.main.centerY - 236, 'x ' + this.coinCount, {
            fontFamily: 'Alagard',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5).setScale(2.0).setScrollFactor(0);
        
        // HEALTH UI
        this.heart = this.add.image(250, 340, 'heart').setScrollFactor(0).setScale(2);
        this.healthCounter = this.add.text(this.cameras.main.centerX - 150, this.cameras.main.centerY - 197, 'x ' + this.health, {
            fontFamily: 'Alagard',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5).setScale(2.0).setScrollFactor(0);

        // KEY UI
        this.keyImage = this.add.image(600, 300, 'key').setScrollFactor(0).setScale(2);
        this.keyCount = this.add.text(this.cameras.main.centerX + 200, this.cameras.main.centerY - 236, 'x ' + this.keysCollected, {
            fontFamily: 'Alagard',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5).setScale(2.0).setScrollFactor(0);


        // player setup
        this.player = this.physics.add.sprite(160, 3500, "characters", 260);
        this.player.setCollideWorldBounds(true);
        this.player.setScale(1.8);
        this.player.setOrigin(0, 0);

        this.player.body.checkCollision.up = true;
        this.player.body.checkCollision.down = true;
        this.player.body.checkCollision.left = true;
        this.player.body.checkCollision.right = true;

        // Make the locks collideable (needs to go after player is created)
        this.physics.add.collider(this.player, this.lockGroup);

        // for key randomization:
        // Pick 4 unique random indices between 1 and 17
        let remainingKeyIndices = Phaser.Utils.Array.NumberArray(1, 17);
        Phaser.Utils.Array.Shuffle(remainingKeyIndices);  // randomize order
        let keyIndices = remainingKeyIndices.slice(0, 4);  // pick first 4

        // enemy setup (18 total)
        this.enemies = this.physics.add.group(); // this is going to contain all enemies, regardless of type
        const enemySpawns = [ { x: 654, y: 3331 }, // Shell closest to the spawn point 
                              { x: 638, y: 2970 }, // Fly on top of box with an X
                              { x: 927, y: 2915 }, // Shell beneath spike entrance to tunnel 
                              { x: 670, y: 2395 }, // Fly on top of spike entrance to tunnel

                              { x: 700, y: 2051 }, // Shell on top of two fans
                              { x: 324, y: 1917 }, // Fly near four stacked fans
                              { x: 290, y: 1571 }, // Shell on top of three fans
                              { x: 1267, y: 2072 }, // Fly in the center opening of the tunnel

                              { x: 1632, y: 3235 }, // Shell between bottom left and bottom right
                              { x: 1887, y: 3332 },  // Fly near 10 coin cave
                              { x: 1823, y: 1827 },  // Shell on top of fan vertical jump zigzag
                              { x: 1776, y: 2841 },  // Fly in fan vertical zig zag

                              { x: 367, y: 1315 }, // Shell in the secret middle part
                              { x: 1520, y: 1240 }, // Fly on the pyramid looking block
                              { x: 1206, y: 643 }, // Shell in the middle between two elevated platforms (near the top left)
                              { x: 453, y: 540 }, // Fly at the very top left

                              { x: 2017, y: 1251 }, // Shell on top of the spike vertical jump zig zag (on the middle right)
                              { x: 2012, y: 189 }, // Fly near the exit
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

            enemy.setScale(1.8);
            this.enemies.add(enemy);
        });

        // collisions
        this.physics.add.collider(this.player, this.groundLayer);
        this.physics.add.collider(this.player, this.foregroundLayer);
        this.physics.add.collider(this.enemies, this.groundLayer);

        // gun setup
        this.gun = this.add.sprite(this.player.x + 25, this.player.y + 20, 'gun');
        this.gunActive = false;
        this.gun.setScale(2.5);
        this.gun.setVisible(false);
        this.gun.setOrigin(0.2, 0.5);
        this.gun.rotationSpeed = 0.02;
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

        // handle collision with keys
        this.keyGroup = this.physics.add.group();
        this.physics.add.collider(this.keyGroup, this.groundLayer);

        this.physics.add.overlap(this.player, this.keyGroup, (player, key) => {
            key.destroy();
            this.keysCollected++;
            this.keyCount.setText('x ' + this.keysCollected);
            this.sound.play("keyCollect", {
                    volume: 0.5
                });

            this.unlockNextLock();
        });


        // Handle collision detection with coins
                this.physics.add.overlap(this.player, this.coinGroup, (obj1, obj2) => {
                    //trigger particle effect
                    this.coinCollectParticles.explode(10, obj2.x, obj2.y);
                    // remove coin on overlap
                    obj2.destroy(); 
                    this.coinCount++;
                    this.coinScore.setText('x ' + this.coinCount);
                    this.sound.play("coinCollect", {
                            volume: 0.5
                        });
                        
                    // Add health for every 10 coins collected
                    if (this.coinCount % 10 == 0) {
                        this.health++;
                        this.healthCounter.setText('x ' + this.health);
                        this.sound.play("heal", {
                            volume: 0.5
                        });
                    }
                })

        // player damage cooldowns
        this.canTakeDamage = true;
        this.damageCooldown = 5000; // 1 second

        // Handle collision detection with spikes
        this.physics.add.overlap(this.player, this.spikeGroup, () => {
            this.playerTakeDamage();
        });

        // Handle collision detection with enemies
        this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
            if (enemy.alive) {
                this.playerTakeDamage();
            }
        });
        
        //handle collision with door
        this.physics.add.overlap(this.player, this.doorGroup, () => {
            /*this.sound.play("keyCollect", {
                    volume: 0.5
                });*/
            // Can have it take you to the menu screen immediately since you need 5 keys to access anyways
            this.showWinScreen();
        });
        
        // camera code
        this.cameras.main.setBounds(0, 0, 2570, 4000);
        this.physics.world.setBounds(0, 0, 2570, 4000);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08, 100, 0);
        this.cameras.main.setDeadzone(150, 150);
        this.cameras.main.setZoom(2.0);
        this.cameras.main.followOffset.set(-100, 0);
        this.physics.world.TILE_BIAS = 40; // should help with not having the player go through tiles while falling

        // Allow restarting the game
        this.input.keyboard.on('keydown-R', () => {
            if (this.gameOver) {
                this.sound.play("select_2", { volume: 0.5 });
                this.isHurt = false;
                this.scene.restart();
            }
        });


        // finally, initialize the animated tiles plugin
        // broken rn tho
        //this.animatedTiles.init(this.map);
    }

    update() {

        // have to put update for each class since Phaser doesn't do it automatically :/
        this.enemies.children.iterate(enemy => {
            if (enemy && enemy.update) {
                enemy.update();
            }
        });

        if (this.inputEnabled) {
            // First, handle movement
            if (this.cursors.left.isDown || this.keys.A.isDown) {
                this.player.setAccelerationX(-this.ACCELERATION);
                this.player.setFlip(true, false);
                this.cameras.main.followOffset.set(100, 50);
            } else if (this.cursors.right.isDown || this.keys.D.isDown) {
                this.cameras.main.followOffset.set(-100, 50);
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
            this.player.setDragX(this.player.body.blocked.down ? this.DRAG : this.AIR_DRAG);

            // Gravity
            //this.player.setGravityY(!this.player.body.blocked.down && this.player.body.velocity.y > 0 ? this.physics.world.gravity.y : 0);

            // Handle jumping input
            if (this.player.body.blocked.down && (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keys.W) || Phaser.Input.Keyboard.JustDown(this.spaceKey))) {
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
                if (!this.isHurt) {
                    if (this.player.body.velocity.x !== 0) {
                        this.player.anims.play('walk', true);
                    } else {
                        this.player.anims.play('idle', true);
                    }
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
                //this.player.setTexture('playerGun');

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
        }
        else this.player.setVelocityX(0);

        // OPTIMIZATION: set enemies invisible if they're not close to the player -> lags otherwise
        const cam = this.cameras.main;

        this.enemies.children.iterate(enemy => {
            if (!enemy) return;

            if (!Phaser.Geom.Intersects.RectangleToRectangle(cam.worldView-20, enemy.getBounds())) {
                enemy.body.enable = false;
                enemy.setVisible(false);
            } else {
                enemy.body.enable = true;
                enemy.setVisible(true);
            }
        });
        
        
        // Check for nearby pending locks to unlock
        this.pendingUnlocks = this.pendingUnlocks.filter(lock => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                lock.x, lock.y
            );

            if (distance < 200) { // adjust proximity as needed
                this.lockGroup.remove(lock, true, true);
                this.sound.play("unlock", { volume: 0.5 });
                this.coinCollectParticles.explode(10, lock.x + 18, lock.y - 20);
                return false; // remove from pendingUnlocks
            }
            return true; // keep it in the list if still too far
        });
        
        let allKeysCollected = false;

        // LOSE CONDITIONS
        if (this.health <= 0) {
            this.playerAlive = false;
            this.endScreen();
        }
    }

    spawnKey(x, y) {
        const key = this.keyGroup.create(x, y, 'key');
        key.setScale(2.0);
        key.setBounce(0.3);
        key.setCollideWorldBounds(true);
        this.sound.play("keyDrop", {
            volume: 0.5
        });
        console.log("Spawned key!");
    }


    unlockNextLock() {
        if (this.keysCollected <= this.lockArray.length) {
            const lockToUnlock = this.lockArray[this.lockArray.length - this.keysCollected]; // reverse order
            if (lockToUnlock) {
            // Queue it for unlocking when the player gets close
            this.pendingUnlocks.push(lockToUnlock);
            }
        }  
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

    playerTakeDamage() {
        if (this.canTakeDamage) {
            if (this.playerAlive){
                this.health--;
                this.healthCounter.setText('x ' + this.health);

                this.sound.play("hurt", { volume: 0.5 });

                this.canTakeDamage = false;
                this.isHurt = true;
                this.player.anims.stop();
                this.player.anims.play('hurt', true);

                // Reset the flag after a delay
                this.time.delayedCall(this.damageCooldown, () => {
                    this.canTakeDamage = true;
                    this.isHurt = false;
                });
            }
        }
    }

    endScreen() {
        // prevent repeat execution
        if (this.gameOver) return;
        this.gameOver = true;

        this.inputEnabled = false;
        this.player.setAccelerationX(0);
        this.sound.play("death", { volume: 0.5 });

        // Dim background layers
        this.bgLayer.alpha = 0.15;
        this.groundLayer.alpha = 0.3;
        this.foregroundLayer.alpha = 0.3;

        this.coins.forEach(coin => coin.alpha = 0.3);
        this.spikeGroup.getChildren().forEach(spike => spike.alpha = 0.3);
        this.keyGroup.getChildren().forEach(key => key.alpha = 0.3);
        this.enemies.getChildren().forEach(enemy => enemy.alpha = 0.3);
        if (this.door) this.door.alpha = 0.3;

        // don't let the player provide keyboard input unless it's to restart the game
        

        const { centerX, centerY } = this.cameras.main;

        // Add game over text
        this.add.text(centerX, centerY - 50, "Game Over", {
            fontFamily: 'Alagard',
            fontSize: '75px',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0);

        this.add.text(centerX, centerY + 50, `Press R to Restart`, {
            fontFamily: 'Alagard',
            fontSize: '38px',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0);
    }

    showWinScreen() {
        if (this.gameOver) return;
        this.gameOver = true;

        this.inputEnabled = false;
        this.player.setAccelerationX(0);
        this.sound.play("win", { volume: 0.5 });

        // Dim background layers
        this.bgLayer.alpha = 0.15;
        this.groundLayer.alpha = 0.3;
        this.foregroundLayer.alpha = 0.3;

        this.coins.forEach(coin => coin.alpha = 0.3);
        this.spikeGroup.getChildren().forEach(spike => spike.alpha = 0.3);
        this.keyGroup.getChildren().forEach(key => key.alpha = 0.3);
        this.enemies.getChildren().forEach(enemy => enemy.alpha = 0.3);
        if (this.door) this.door.alpha = 0.3;

        const { centerX, centerY } = this.cameras.main;

        // Add win text
        this.add.text(centerX, centerY - 100, "You Won!", {
            fontFamily: 'Alagard',
            fontSize: '75px',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0);

        this.add.text(centerX, centerY, `Coins Collected: ${this.coinCount}`, {
            fontFamily: 'Alagard',
            fontSize: '38px',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0);

        this.add.text(centerX, centerY + 70, `Press R to Restart`, {
            fontFamily: 'Alagard',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0);
    }
}
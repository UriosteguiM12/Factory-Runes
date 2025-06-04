class Enemy extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture, id, patrolDistance) {

        super(scene, x, y, texture);
        this.scene = scene;
        this.id = id;

        // pathing stuff
        this.startX = x;     // save original spawn point
        this.startY = y;
        this.patrolDistance = patrolDistance; // how far left/right to move
        this.direction = 1;  // 1 = right, -1 = left

        // collision stuff
        this.health = 500;
        this.hasKey = false;
        this.alive = true;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
    }

    // function to determine the proximity between the enemy and player
    // if true is returned, the player is too close to the enemy and that may cause something to happen...
    // shellEnemy will hide and the flyingEnemy will speed up?
    closeProximity(player) {
        if (Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y) < 100) {
            return true;
        }
    }

    takeDamage() {
        if (!this.alive) return;

        this.health -= 100;
        
        if (this.health <= 0) {
            this.play('die'); // 
            this.setVelocity(0, 0);
            this.setCollideWorldBounds(false);
            this.setImmovable(true);
            this.disableBody(false, false);

            /*
            if (this.hasKey) {
                this.spawnKey();
            }
                */
        }
    }

    // function to determine if projectiles are colliding with the enemy
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    // eventually, add a function that spawns the key after the enemy dies if it has one
    /*
    spawnKey() {
        // drop a key at current position -> will only happen if the enemy is dead
        this.scene.spawnKeyAt(this.x, this.y);
    }
        */
}

class ShellEnemy extends Enemy {
    constructor(scene, x, y, texture, id, patrolDistance) {
        super(scene, x, y, texture, id, patrolDistance);
        this.speed = 50;   // pixels per sec
    }

    update() {

        // if the enemy isn't alive, return
        if (!this.alive) return;

        // if the player is too close to the enemy, hide
        if (this.closeProximity(this.scene.player)) {
            this.setTexture('shellIdle');
            this.setVelocityX(0); // stop all movement
        }

        else {
            // WALKING
            // set the velocity in the direction that the enemy is moving
            this.setVelocityX(this.speed * this.direction);

            // Check if enemy has reached patrol limit
            if (this.x > this.startX + this.patrolDistance) {
                this.direction = -1;
                this.anims.play('shellWalking', true);
                this.setFlip(true, false); // face left

            } else if (this.x < this.startX - this.patrolDistance) {
                this.direction = 1;
                this.anims.play('shellWalking', true);
                this.setFlip(false, false); // face right
            }
        }
    }
}

class FlyingEnemy extends Enemy {
    constructor(scene, x, y, id) {
        super(scene, x, y, 'enemy2', id);
        this.speed = 80;
    }

    initAnimations() {
        this.anims.play('enemy2_idle');
    }

    update() {
        if (this.alive) {
            this.setVelocityY(this.speed);
            // handle vertical bouncing logic here
        }
    }
}
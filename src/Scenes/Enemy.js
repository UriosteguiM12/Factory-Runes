class Enemy extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture, patrolDistance) {

        super(scene, x, y, texture);
        this.scene = scene;

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

    takeDamage() {
        if (!this.alive) return;

        this.health -= 100;

        if (this.health <= 0) {
            this.alive = false;

            // remove physics and collisions
            this.setVelocity(0, 0);
            this.setCollideWorldBounds(false);
            this.setImmovable(true);
            this.body.enable = false;

            // play death animation
            this.play('shellDie');

            this.on('animationcomplete', () => {
                this.disableBody(true, true);  // removes from scene

                if (this.hasKey) {
                    const key = this.scene.keyGroup.create(this.x, this.y, 'key');
                    key.setScale(2);
                    key.setBounce(0.2);
                    key.setCollideWorldBounds(true);
                }

                this.destroy();
            });
        }
    }
}

class FlyingEnemy extends Enemy {
    constructor(scene, x, y, texture, id, patrolDistance) {
        super(scene, x, y, texture, id, patrolDistance);
        this.speed = 50;   // pixels per sec
    }

    update() {

        // if the enemy isn't alive, return
        if (!this.alive) return;

        else {
            // FLYING
            // set the velocity in the direction that the enemy is moving
            this.setVelocityY(this.speed * this.direction);

            // Check if enemy has reached patrol limit
            if (this.y > this.startY + this.patrolDistance) {
                this.direction = -1;
                this.anims.play('flyingIdle', true);

            } else if (this.y < this.startY - this.patrolDistance) {
                this.direction = 1;
                this.anims.play('flyingIdle', true);
            }
        }
    }

    takeDamage() {
        if (!this.alive) return;

        this.health -= 100;

        if (this.health <= 0) {
            this.alive = false;

            // remove physics and collisions
            this.setVelocity(0, 0);
            this.setCollideWorldBounds(false);
            this.setImmovable(true);
            this.body.enable = false;

            // play death animation
            this.play('flyingDie');

            this.on('animationcomplete', () => {
                this.disableBody(true, true);  // removes from scene
                // if the enemy has a key, it will spawn after the death animation
                if (this.hasKey) {
                    const key = this.scene.keyGroup.create(this.x, this.y, 'key');
                    key.setScale(2);
                    key.setBounce(0.2);
                    key.setCollideWorldBounds(true);
                }

                this.destroy();
            });
        }
    }
}
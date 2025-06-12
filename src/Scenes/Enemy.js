class Enemy extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture, patrolDistance) {

        super(scene, x, y, texture);
        this.scene = scene;

        // PATHING
        this.startX = x;     // save original spawn point
        this.startY = y;
        this.patrolDistance = patrolDistance; // how far left/right to move
        this.direction = 1;  // 1 = right, -1 = left
        this.shellOnly = false; // flag for ricochet mechanic

        // COLLISION FLAGS
        this.health = 500;
        this.hasKey = false;
        this.alive = true;

        // PHYSICS
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
    }

    // Function to determine if the player is too close to the enemy
    closeProximity(player) {
        if (Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y) < 100) {
            return true;
        }
    }

}

class ShellEnemy extends Enemy {
    
    constructor(scene, x, y, texture, patrolDistance) {
        super(scene, x, y, texture, patrolDistance);
        this.speed = 50;   // pixels per sec
    }

    update() {

        // If the enemy isn't alive, return
        if (!this.alive) return;

        // If the player is too close to the enemy, hide
        if (this.closeProximity(this.scene.player)) {
            this.shellOnly = true;
            this.setTexture('shellIdle');
            this.setVelocityX(0); // stop all movement
        }

        else {
            // WALKING
            // Set the velocity in the direction that the enemy is moving
            this.shellOnly = false;
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

        // If the enemy isn't alive, return
        if (!this.alive) return;

        // Reduce health + play sound
        this.health -= 100;
        this.scene.sound.play("enemyHurt", {
            volume: 0.5
        });

        // Delete the enemy once it's dead
        if (this.health <= 0) {
            this.alive = false;

            // remove physics and collisions
            this.setVelocity(0, 0);
            this.setCollideWorldBounds(false);
            this.setImmovable(true);
            this.body.enable = false;

            // play death animation
            this.play('shellDie');
            this.alive = false;

            // play death sound
            this.scene.sound.play("enemyDeath", {
                volume: 0.5
            });

            // Check if enemy has a key and spawn it
            this.on('animationcomplete', () => {
                this.disableBody(true, true);  // removes from scene

                if (this.hasKey) {
                    this.scene.spawnKey(this.x, this.y);
                }
                this.destroy();
            });
        }
    }
}

class FlyingEnemy extends Enemy {

    constructor(scene, x, y, texture, patrolDistance) {
        super(scene, x, y, texture, patrolDistance);
        this.speed = 50;   // pixels per sec
    }

    update() {

        // If the enemy isn't alive, return
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

        // If the enemy isn't alive, return
        if (!this.alive) return;

        // Reduce health + play sound
        this.health -= 100;
        this.scene.sound.play("enemyHurt", {
            volume: 0.5
        });

        // Delete the enemy once it's dead
        if (this.health <= 0) {
            this.alive = false;

            // remove physics and collisions
            this.setVelocity(0, 0);
            this.setCollideWorldBounds(false);
            this.setImmovable(true);
            this.body.enable = false;

            // play death animation
            this.play('flyingDie');
            this.alive = false;

            // play death sound
            this.scene.sound.play("enemyDeath", {
                volume: 0.5
            });

            // Check if enemy has a key and spawn it
            this.on('animationcomplete', () => {
                this.disableBody(true, true);  // removes from scene
                
                if (this.hasKey) {
                    this.scene.spawnKey(this.x, this.y);
                }
                this.destroy();
            });
        }
    }
}
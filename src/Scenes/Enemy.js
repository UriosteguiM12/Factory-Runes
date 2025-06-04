class Enemy extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture, [frame], id) {

        super(scene, x, y, texture, [frame]);
        this.scene = scene;
        this.id = id;
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

        this.alive = false;
        this.play('die'); // your death animation
        this.setVelocity(0, 0);
        this.setCollideWorldBounds(false);
        this.setImmovable(true);
        this.disableBody(false, false);

        if (this.hasKey) {
            this.spawnKey();
        }
    }

    // function to determine if projectiles are colliding with the enemy
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    spawnKey() {
        // drop a key at current position -> will only happen if the enemy is dead
        this.scene.spawnKeyAt(this.x, this.y);
    }
}

class ShellEnemy extends Enemy {
    constructor(scene, x, y, id) {
        super(scene, x, y, 'enemy1', id);
        this.speed = 100;
    }

    initAnimations() {
        this.anims.play('enemy1_idle');
    }

    update() {
        if (this.alive) {
            this.setVelocityX(this.speed);
            // handle turn-around logic here
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
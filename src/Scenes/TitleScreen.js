class TitleScreen extends Phaser.Scene{

    constructor() {
        super("TitleScreen");
    }

    preload() {

        this.load.setPath("./assets/");
        this.load.image('controlButton', 'controlButton.png');
        this.load.image('creditButton', 'creditButton.png');
        this.load.image('startButton', 'startButton.png');
    }

    create() {

        const controlButton = this.add.image(290, 950, 'controlButton').setInteractive();
        const creditButton = this.add.image(600, 950, 'creditButton').setInteractive();
        const startButton = this.add.image(450, 850, 'startButton').setInteractive();
        
        controlButton.setScale(4.5);
        creditButton.setScale(4.5);
        startButton.setScale(4.5);

        controlButton.on('pointerdown', () => {
            this.scene.start('Controls');
        });
        
        creditButton.on('pointerdown', () => {
            this.scene.start('Credits');
        });

        startButton.on('pointerdown', () => {
            this.scene.start('LevelOne');
        });

        // Create a graphics object
        const graphics = this.add.graphics();

        // Set line style: width, color, alpha
        graphics.lineStyle(4, 0xffffff, 1);  // 4px wide, white, full opacity

        // Draw the line from (x1, y1) to (x2, y2)
        graphics.beginPath();
        graphics.moveTo(0, 750);       // start point
        graphics.lineTo(1000, 750);     // end point
        graphics.strokePath();

        this.add.text(460, 130, 'Factory Runes', {
            fontFamily: 'Alagard',
            fontSize: '120px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(460, 640, 'Kill enemies to collect keys!\n\n\nYou need 5 keys to escape!', {
            fontFamily: 'PressStart',
            fontSize: '25px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

    }

    update() {

    }

}
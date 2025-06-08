class Controls extends Phaser.Scene{

    constructor() {
        super("Controls");
    }

    preload() {

        this.load.setPath("./assets/");
        this.load.image('homeButton', 'homeButton.png');

    }

    create() {

        const titleText = this.add.text(450, 100, 'CONTROLS', {
            fontFamily: 'Alagard',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(1.0);

        titleText.setResolution(2);
        
        const bodyText = this.add.text(425, 350, 'A+D or arrow keys ---- Move\n\n\nW, Space, Up arrow key --- Jump\n\n\nQ (Hold) -------- Aim\n\n\nE ------- Fire', {
            fontFamily: 'PressStart',
            fontSize: '12px',
            color: '#ffffff'
        }).setOrigin(0.9);
        bodyText.setResolution(2);

        const homeButton = this.add.image(450, 950, 'homeButton').setInteractive();
        homeButton.setScale(4.5);

        homeButton.on('pointerdown', () => {
            this.scene.start('TitleScreen');
        });

    }

    update() {
        
    }

}
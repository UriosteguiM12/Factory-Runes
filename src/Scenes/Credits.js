class Credits extends Phaser.Scene{

    constructor() {
        super("Credits");
    }

    preload() {

        this.load.setPath("./assets/");
        this.load.image('homeButton', 'homeButton.png');
    }

    create() {

        const titleText = this.add.text(425, 100, 'CREDITS', {
            fontFamily: 'Alagard',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.9);

        titleText.setResolution(2); 

        const homeButton = this.add.image(450, 950, 'homeButton').setInteractive();
        homeButton.setScale(4.5);

        homeButton.on('pointerdown', () => {
            this.scene.start('TitleScreen');
        });



    }

    update() {
        
    }

}
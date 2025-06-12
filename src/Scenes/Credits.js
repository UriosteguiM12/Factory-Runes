class Credits extends Phaser.Scene{

    constructor() {
        super("Credits");
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image('homeButton', 'homeButton.png');
    }

    create() {
        // TITLE
        const titleText = this.add.text(425, 100, 'CREDITS', {
            fontFamily: 'Alagard',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.9);

        titleText.setResolution(2);
        
        // BODY
        const bodyText = this.add.text(425, 400, 'A game by Marina Uriostegui and Erin Casey\n\n\nSound effects and assets by Kenny\n\n\nGo check out http://support.kenney.nl!!\n\n\nAlagard font by Hewett Tsoi from\nhttps://www.dafont.com/alagard.font\n\n\nPress Start 2P font from\nhttps://www.dafont.com/press-start-2p.font', {
            fontFamily: 'PressStart',
            fontSize: '10px',
            color: '#ffffff'
        }).setOrigin(0.9);

        bodyText.setResolution(2);

        // BUTTON
        const homeButton = this.add.image(450, 950, 'homeButton').setInteractive();
        homeButton.setScale(4.5);

        homeButton.on('pointerdown', () => {
            this.scene.start('TitleScreen');
            this.sound.play("select_1", {
                volume: 0.5
            });
        });
        
    }
}
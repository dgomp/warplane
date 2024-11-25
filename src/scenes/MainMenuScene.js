export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    preload() {
        this.load.image('backgroundMenu', 'assets/img/backgroundMenu.jpg');
    }

    create() {
        this.add.image(400, 300, 'backgroundMenu');

        const title = this.add.text(400, 150, 'W A R P L A N E', { 
            fontSize: '64px', 
            fill: '#ffffff' 
        }).setOrigin(0.5);

        this.createButton(300, 'INICIAR', () => this.scene.start('GameScene'));
        this.createButton(380, 'CRÉDITOS', () => this.scene.start('CreditsScene'));
        this.createButton(460, 'RANKING', () => this.scene.start('RankingScene'));
    }

    createButton(y, text, onClick) {
        const button = this.add.text(400, y, text, { 
            fontSize: '32px', 
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: 10
        }).setOrigin(0.5).setInteractive();

        button.on('pointerdown', onClick);
        return button;
    }
}
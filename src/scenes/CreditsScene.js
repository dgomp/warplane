export default class CreditsScene extends Phaser.Scene {
    constructor() {
        super('CreditsScene');
    }

    preload() {
        this.load.image('background', '../assets/img/backgroundMenu.jpg');
    }

    create() {
        this.add.image(400, 300, 'background');
        this.createCreditsContent();
        this.createBackButton();
    }

    createCreditsContent() {
        const creditsTitle = this.add.text(400, 100, 'CRÉDITOS', { 
            fontSize: '48px', 
            fill: '#ffffff' 
        }).setOrigin(0.5);

        const creditsText = this.add.text(400, 320, 
            'Desenvolvido por\n' +
            'Diego Parente\n\n' +
            'Arte e Gráficos\n' +
            'Canva, Leonardo.Ai\n\n' +
            'Design de Áudio\n' +
            'Open Game Art\n\n' +
            'Música\n' +
            'The Prodigy - Invaders Must Die', 
            { 
                fontSize: '24px', 
                fill: '#ffffff',
                align: 'center',
                lineSpacing: 10
            }
        ).setOrigin(0.5);

        [creditsTitle, creditsText].forEach(text => {
            text.setInteractive();
            
            text.on('pointerover', () => {
                text.setStyle({ fill: '#ffff00' });
            });
            
            text.on('pointerout', () => {
                text.setStyle({ fill: '#ffffff' });
            });
        });
    }

    createBackButton() {
        const backButton = this.add.text(400, 550, 'VOLTAR', { 
            fontSize: '32px', 
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 },
            borderRadius: 5
        }).setOrigin(0.5).setInteractive();

        backButton.on('pointerover', () => {
            backButton.setStyle({ fill: '#ffff00' });
            this.input.setDefaultCursor('pointer');
        });

        backButton.on('pointerout', () => {
            backButton.setStyle({ fill: '#ffffff' });
            this.input.setDefaultCursor('default');
        });

        backButton.on('pointerdown', () => {
            backButton.setStyle({ fill: '#ff0000' });
        });

        backButton.on('pointerup', () => {
            backButton.setStyle({ fill: '#ffffff' });
            this.scene.start('MainMenuScene');
        });
    }
}
import { db } from './firebaseConfig';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default class RankingScene extends Phaser.Scene {
    constructor() {
        super('RankingScene');
    }

    preload() {
        this.load.image('background', '../assets/img/background.png');
    }

    create() {
        this.add.image(400, 300, 'background');
        
        this.add.text(400, 100, 'RANKING', {
            fontSize: '48px', 
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        const backButton = this.add.text(400, 500, 'VOLTAR AO MENU', {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        backButton.on('pointerover', () => backButton.setStyle({ fill: '#ffff00' }));
        backButton.on('pointerout', () => backButton.setStyle({ fill: '#ffffff' }));
        backButton.on('pointerdown', () => this.scene.start('MainMenuScene'));

        this.loadRankingData();
    }

    async loadRankingData() {
        try {
            const q = query(
                collection(db, 'highScores'), 
                orderBy('score', 'desc'), 
                limit(5)
            );
            const querySnapshot = await getDocs(q);
            
            const rankings = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                rankings.push({
                    name: data.name,
                    score: data.score,
                    date: data.date
                });
            });

            this.displayRankings(rankings);
        } catch (error) {
            console.error("Error fetching rankings:", error);
            this.displayError();
        }
    }

    displayRankings(rankings) {
        const startY = 200;
        const spacing = 60;

        this.add.text(200, startY - 40, 'Posição', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(400, startY - 40, 'Nome', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(600, startY - 40, 'Pontuação', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        if (rankings.length === 0) {
            this.add.text(400, 300, 'Nenhuma pontuação registrada', {
                fontSize: '32px',
                fill: '#ffffff'
            }).setOrigin(0.5);
            return;
        }

        rankings.forEach((ranking, index) => {
            this.add.text(200, startY + (spacing * index), `${index + 1}º`, {
                fontSize: '32px',
                fill: '#ffffff'
            }).setOrigin(0.5);

            this.add.text(400, startY + (spacing * index), ranking.name, {
                fontSize: '32px',
                fill: '#ffffff'
            }).setOrigin(0.5);

            this.add.text(600, startY + (spacing * index), ranking.score.toString(), {
                fontSize: '32px',
                fill: '#ffffff'
            }).setOrigin(0.5);
        });
    }

    displayError() {
        this.add.text(400, 300, 'Erro ao carregar ranking', {
            fontSize: '32px',
            fill: '#ff0000'
        }).setOrigin(0.5);
    }
}
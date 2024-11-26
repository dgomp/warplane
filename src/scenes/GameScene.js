import { GAME_CONFIG } from '../constants';
import { db } from './firebaseConfig';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.score = 0;
        this.lastShotTime = 0;
        this.shotDelay = GAME_CONFIG.SHOT_DELAY;
    }

    preload() {
        this.load.image('background', '../assets/img/background.png');
        this.load.image('player', '../assets/img/spaceship.png');
        this.load.image('enemy', '../assets/img/enemy.png');
        this.load.image('bullet', '../assets/img/bullet.png');
        this.load.image('enemyBullet', '../assets/img/bullet.png');
        this.load.audio('startMusic', '../assets/audio/gameMusic.mp3');
        this.load.audio('bulletSound', '../assets/audio/bullet.wav');
        this.load.audio('explosionSound', '../assets/audio/explosion.ogg');
        this.load.audio('gameOverSound', '../assets/audio/gameover.mp3');
        this.load.audio('timeOutSound', '../assets/audio/timeout.mp3');
    }

    create() {
        this.setupAudio();
        this.setupGameObjects();
        this.setupPhysics();
        this.setupUI();
        this.setupEvents();
    }

    setupAudio() {
        this.startMusic = this.sound.add('startMusic', {
            volume: 3,
            loop: true
        });
        
        this.bulletSound = this.sound.add('bulletSound', {
            volume: 0.5
        });
        
        this.bulletEnemySound = this.sound.add('bulletSound', {
            volume: 0.2
        });

        this.explosionSound = this.sound.add('explosionSound', {
            volume: 0.3
        });

        this.gameOverSound = this.sound.add('gameOverSound', {
            volume: 0.3
        });

        this.timeOutSound = this.sound.add('timeOutSound', {
            volume: 0.3
        });

        this.startMusic.play();
    }

    setupGameObjects() {
        this.add.image(400, 300, 'background');
        this.player = this.physics.add.sprite(400, 550, 'player');
        this.player.setCollideWorldBounds(true);
        this.setupGroups();
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    setupGroups() {
        this.bullets = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            maxSize: 20,
            runChildUpdate: true
        });

        this.enemyBullets = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            maxSize: 20,
            runChildUpdate: true
        });

        this.enemies = this.physics.add.group();
    }

    setupPhysics() {
        this.physics.add.overlap(
            this.bullets,
            this.enemies,
            this.destroyEnemy,
            null,
            this
        );

        this.physics.add.overlap(
            this.player,
            this.enemies,
            this.gameOverScene,
            null,
            this
        );

        this.physics.add.overlap(
            this.player,
            this.enemyBullets,
            this.gameOverScene,
            null,
            this
        );
    }

    setupUI() {
        this.scoreText = this.add.text(16, 16, 'Pontuação: 0', {
            fontSize: '32px',
            fill: '#ffffff'
        });

        this.timeLimit = GAME_CONFIG.TIME_LIMIT;
        this.timerText = this.add.text(16, 50, 'Tempo: ' + this.timeLimit, {
            fontSize: '32px',
            fill: '#ffffff'
        });
    }

    setupEvents() {
        this.time.delayedCall(1000, this.createEnemy, [], this);
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        this.enemyEvent = this.time.addEvent({
            delay: GAME_CONFIG.ENEMY_SPAWN_DELAY,
            callback: () => this.createEnemy(),
            loop: true
        });
    }

    update() {
        if (this.gameOver) return;
        
        this.handlePlayerMovement();
        this.handleEnemies();
        this.handleShooting();
        this.cleanupBullets();
    }

    handlePlayerMovement() {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-GAME_CONFIG.PLAYER_SPEED);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(GAME_CONFIG.PLAYER_SPEED);
        } else {
            this.player.setVelocityX(0);
        }
    }

    handleEnemies() {
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.body.touching.left || enemy.body.touching.right) {
                enemy.setVelocityY(100);
            }

            if (enemy.y > 577) {
                enemy.destroy();
            }

            if (!enemy.lastShot) {
                enemy.lastShot = 0;
            }

            if (this.time.now - enemy.lastShot > 1000) {
                this.enemyShoot(enemy);
                enemy.lastShot = this.time.now;
            }
        });
    }

    handleShooting() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space) &&
            this.time.now - this.lastShotTime > this.shotDelay) {
            this.shootBullet();
            this.lastShotTime = this.time.now;
        }
    }

    createEnemy() {
        const enemy = this.enemies.create(
            Phaser.Math.Between(50, 750),
            100,
            'enemy'
        );
        
        enemy.setBounce(1, 0);
        enemy.setVelocityX(
            Phaser.Math.Between(
                GAME_CONFIG.ENEMY_SPEED.MIN,
                GAME_CONFIG.ENEMY_SPEED.MAX
            )
        );
        enemy.setVelocityY(50);
        enemy.setCollideWorldBounds(true);
        enemy.hp = GAME_CONFIG.ENEMY_HP;
        enemy.lastShot = 0;
    }

    enemyShoot(enemy) {
        const bullet = this.enemyBullets.get(enemy.x, enemy.y + 20, 'enemyBullet');
        
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.body.enable = true;
            bullet.setTint(0xff0000);
            this.bulletEnemySound.play();
            
            const angle = Phaser.Math.Angle.Between(
                enemy.x, enemy.y,
                this.player.x, this.player.y
            );

            this.physics.velocityFromRotation(angle, 200, bullet.body.velocity);
        }
    }

    shootBullet() {
        const bullet = this.bullets.get(
            this.player.x,
            this.player.y - 50,
            'bullet'
        );
        
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.body.enable = true;
            bullet.setVelocityY(-GAME_CONFIG.BULLET_SPEED);
            bullet.setTint(0xFFFFFF);
            this.bulletSound.play();
        }
    }

    cleanupBullets() {
        this.bullets.children.entries.forEach(bullet => {
            if (bullet.y < 0) {
                bullet.destroy();
            }
        });

        this.enemyBullets.children.entries.forEach(bullet => {
            if (bullet.y > 600 || bullet.y < 0 || bullet.x > 800 || bullet.x < 0) {
                bullet.destroy();
            }
        });
    }

    destroyEnemy(bullet, enemy) {
        bullet.destroy();

        if (enemy.hp > 0) {
            enemy.hp--;

            if (enemy.hp === 1) {
                enemy.setTint(0xffa500);
            }
        }

        if (enemy.hp <= 0) {
            enemy.destroy();
            this.explosionSound.play();
            this.score += GAME_CONFIG.SCORE_PER_KILL;
            this.scoreText.setText('Pontuação: ' + this.score);
        }
    }

    updateTimer() {
        if (this.gameOver) return;

        this.timeLimit--;
        this.timerText.setText('Tempo: ' + this.timeLimit);

        if (this.timeLimit <= 0) {
            this.endGame('TEMPO ESGOTADO');
            this.timeOutSound.play();
        }
    }

    gameOverScene(player, enemy) {
        this.endGame('GAME OVER');
        this.gameOverSound.play();
    }

    endGame(message) {
        this.gameOver = true;
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.enemyEvent.destroy();
        this.startMusic.stop();

        const gameOverText = this.add.text(400, 180, message, {
            fontSize: '64px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const finalScoreText = this.add.text(400, 250, `Pontuação Final: ${this.score}`, {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const nameLabel = this.add.text(400, 300, 'Digite seu nome:', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const nameInput = this.add.dom(400, 340, 'input', {
            type: 'text',
            placeholder: 'Digite seu nome',
            style: 'padding: 10px; width: 200px; text-align: center; font-size: 16px; border-radius: 5px; border: none; text-align-last: center;'
        }).setOrigin(0.5);

        const saveButton = this.add.text(400, 400, 'SALVAR PONTUAÇÃO', {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        const returnButton = this.add.text(400, 460, 'VOLTAR AO MENU', {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        [saveButton, returnButton].forEach(button => {
            button.on('pointerover', () => button.setStyle({ fill: '#ffff00' }));
            button.on('pointerout', () => button.setStyle({ fill: '#ffffff' }));
        });

        saveButton.on('pointerdown', async () => {
            const name = nameInput.node.value.trim();
            
            if (!name) {
                nameLabel.setText('Digite seu nome (obrigatório)').setStyle({ fill: '#ff0000' });
                return;
            }

            try {
                nameInput.node.disabled = true;
                saveButton.setStyle({ fill: '#808080' }).setText('SALVANDO...');
                
                const saved = await this.saveHighScore(name);
                
                if (saved) {
                    saveButton.setStyle({ fill: '#00ff00' }).setText('SALVO COM SUCESSO!');
                } else {
                    saveButton.setStyle({ fill: '#808080' }).setText('PONTUAÇÃO INSUFICIENTE');
                }
                saveButton.disableInteractive();
                
            } catch (error) {
                console.error("Erro ao salvar:", error);
                saveButton.setStyle({ fill: '#ff0000' }).setText('ERRO AO SALVAR');
                nameInput.node.disabled = false;
                setTimeout(() => {
                    saveButton.setStyle({ fill: '#ffffff' }).setText('SALVAR PONTUAÇÃO');
                }, 2000);
            }
        });

        returnButton.on('pointerdown', () => {
            this.scene.stop();
            this.scene.start('MainMenuScene');
        });
    }

    async checkHighScore() {
        try {
            const q = query(
                collection(db, 'highScores'),
                orderBy('score', 'desc'),
                limit(5)
            );
            const querySnapshot = await getDocs(q);
            const highScores = querySnapshot.docs.map(doc => doc.data());

            if (highScores.length < 5 || this.score > highScores[highScores.length - 1].score) {
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error checking high scores:", error);
            return false;
        }
    }

    async saveHighScore(playerName) {
        try {
            const isHighScore = await this.checkHighScore();
            
            if (isHighScore) {
                const docRef = await addDoc(collection(db, 'highScores'), {
                    name: playerName,
                    score: this.score,
                    date: new Date().toISOString()
                });
                return docRef.id ? true : false;
            }
            return false;
        } catch (error) {
            console.error("Error saving high score:", error);
            throw error;
        }
    }

    cleanup() {
        this.physics.resume();
        this.timerEvent?.destroy();
        this.enemyEvent?.destroy();
        this.sound.stopAll();
        this.bullets?.clear(true, true);
        this.enemyBullets?.clear(true, true);
        this.enemies?.clear(true, true);
        this.gameOver = false;
        this.score = 0;
        this.lastShotTime = 0;
        
        if (this.player) {
            this.player.destroy();
        }
    }

    shutdown() {
        this.cleanup();
        super.shutdown();
    }

    init() {
        this.physics.resume();
        this.gameOver = false;
        this.score = 0;
        this.lastShotTime = 0;
    }
}
import MainMenuScene from './scenes/MainMenuScene';
import GameScene from './scenes/GameScene';
import CreditsScene from './scenes/CreditsScene';
import RankingScene from './scenes/RankingScene';

export const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game',
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 0 },
          debug: false
      }
  },
  dom: {
    createContainer: true
},
  scene: [MainMenuScene, GameScene, CreditsScene, RankingScene]
};
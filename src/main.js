import Phaser, { Game } from 'phaser'

import GameScene from './scenes/GameScene'
import GameOver from './scenes/GameOver'
import level2 from './scenes/level2'

const config = {
	type: Phaser.AUTO,
	parent: 'app',
	width: 480,
	height: 640,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 },
		},
	},
	scene: [GameScene, level2, GameOver],
}

export default new Phaser.Game(config)

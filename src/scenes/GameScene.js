import Phaser from "phaser"
export default class GameScene extends Phaser.Scene {
	constructor() {
		super("game-scene")
	}

	init() {
		this.var = undefined
		this.xLemparan = undefined
		this.background = undefined
		this.platform = undefined
		this.char = undefined
		this.cursor = undefined
		this.ground = undefined
		this.coin = undefined
		this.jump = 0;
		this.score = 0;
		this.scorelabel=undefined
	}

	preload() {
		this.load.spritesheet("char", "../../public/assets/kenney_platformer-art-deluxe/BasePack/Player/p1_stand.png", {
			frameWidth: 64,
			frameHeight: 92,
		})
		this.load.image("bg", "../../public/assets/kenney_platformer-art-deluxe/BasePack/bg.png")
		this.load.image("log", "../../public/assets/kenney_platformer-art-deluxe/BasePack/Tiles/bridgeLogs.png")
		this.load.image("platform", "../../public/assets/kenney_platformer-art-deluxe/BasePack/Tiles/bridge.png")
		this.load.image("coin", "../../public/assets/kenney_platformer-art-deluxe/BasePack/Items/coinGold.png")
	}

	createPlatform() {
		this.platform = this.physics.add.staticGroup()
		let YLevel = 100
		for (let i = 0; i < 10; i++) {
			//Game width: 480, Game Height: 640
			let randomX = Math.floor(Math.random() * 480)
			if (YLevel < 530) {
				this.platform.create(randomX, YLevel, "platform")
				this.coin.create(randomX, YLevel - 35, "coin")
				YLevel += 65
			}
		}
	}
	
	createAnimation() {
		this.anims.create({
			key: "left",

		})
	}

	create() {
		this.ground = this.physics.add.staticGroup()
		this.background = this.add.image(240, 320, "bg")
		this.background.setScale(3)
		this.platform = this.physics.add.staticGroup()
		this.coin = this.physics.add.staticGroup()
		this.createPlatform()
		this.char = this.physics.add.sprite(200, 570, "char")
		this.char.setCollideWorldBounds(true)
		this.physics.add.collider(this.char, this.ground)
		this.physics.add.collider(this.char, this.platform)
		this.cursor = this.input.keyboard.createCursorKeys()
		let cords = 30
		for (let i = 0; i < 10; i++) {
			this.ground.create(cords, 625, "log")
			cords += 71
		}
		this.physics.add.overlap(this.char,this.coin,this.collectCoin,null,this)
		this.scoreLabel = this.add.text(10, 10, 'Score: 0', {
			color: 'white',
			backgroundColor: 'black'
		  }).setDepth(1);
	}

	update(time) {
		if (this.cursor.left.isDown) {
			this.char.setVelocity(-200, 200)
			this.char.setFlipX(true)
		} else if (this.cursor.right.isDown) {
			this.char.setFlipX(false)
			this.char.setVelocity(200, 200)
		} else {
			this.char.setVelocity(0, 200)
			this.char.
		}
		if (this.cursor.up.isDown) {
			this.char.setVelocity(0, -200)
			this.jump += 1;

		}
		
		
		// TAMBAH KODE UNTUK CEK KALAU SUDAH LONCAT ATAU BELUM, TERUS KALAU SUDAH LONCAT, JIKA SENTUH GROUND MAKA AKAN MATI
		
		// if (this.jump > 1 && this.physics.collide(this.char,this.ground)) {
		// 	this.char.destroy(true);
		// }
		// this.input.keyboard.on("keydown-RIGHT", () => {
		// 	this.char.setVelocity(200,200)
		// 	this.char.flipX = false
		// })
		// this.input.keyboard.on("keydown-LEFT", () => {
		// 	this.char.setVelocity(-200,200)
		// 	this.char.flipX = true
		// })
		// this.input.keyboard.on("keydown-UP",() => {
		// 	this.char.setVelocity(0,-200)
		// })
	}
	collectCoin(char,coin)
	{
		coin.destroy()
		this.score += 1;
    	this.scoreLabel.setText(`Score: ${this.score}`);
	}

}

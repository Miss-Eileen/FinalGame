import Phaser from "phaser"
export default class GameScene extends Phaser.Scene {
    constructor() {
        super('game-scene');
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
        this.scorelabel = undefined
        this.isJumping = false;
        this.background = undefined
        
        // Lives system variables
        this.lives = 3;
        this.livesLabel = undefined;
        this.lastY = 0;
        this.wasOnPlatform = false;
    }

    preload() {
        this.load.spritesheet("char", "../../public/assets/kenney_platformer-art-deluxe/BasePack/Player/p1_stand.png", {
            frameWidth: 64,
            frameHeight: 92,
        })
        this.load.spritesheet("char-jump", "../../public/assets/kenney_platformer-art-deluxe/BasePack/Player/p1_jump.png", {
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
            key: "idle",
            frames: this.anims.generateFrameNumbers("char", { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: "jump",
            frames: this.anims.generateFrameNumbers("char-jump", { start: 0, end: 0 }),
            frameRate: 10,
            repeat: 0,
            // Add this to automatically switch back to idle when jump animation completes
            onComplete: (sprite) => {
                sprite.anims.play('idle');
            }
        });
    }

    create() {
        this.createAnimation();
        this.load.image ('background')
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
        
        // Add lives display
        this.livesLabel = this.add.text(370, 10, `Lives: ${this.lives}`, {
            color: 'white',
            backgroundColor: 'black'
        }).setDepth(1);
    }

    update(time) {
        // Check if character is on the ground or platform
        const onGround = this.char.body.touching.down || this.char.body.blocked.down;
        
        // Save last Y position
        const currentY = this.char.y;
        
        // Check if on platform (not the bottom ground)
        const onPlatform = onGround && currentY < 550;
        
        if (onPlatform) {
            this.wasOnPlatform = true;
        }
        
        // Fall detection - if player was on a platform then falls beyond 600y
        if (this.wasOnPlatform && !onGround && currentY > 550) {
            this.loseLife();
        }
        
        // Basic movement logic
        if (onGround && this.isJumping) {
            this.isJumping = false;
            this.char.anims.play('idle', true);
        }
        
        if (this.cursor.left.isDown) {
            this.char.setVelocityX(-200);
            this.char.setFlipX(true);
        } else if (this.cursor.right.isDown) {
            this.char.setVelocityX(200);
            this.char.setFlipX(false);
        } else {
            this.char.setVelocityX(0);
        }
        
        if (this.cursor.up.isDown && onGround && !this.isJumping) {
            this.char.setVelocityY(-300);
            this.char.anims.play('jump', true);
            this.isJumping = true;
        }
        
        if (!onGround && this.char.body.velocity.y > -100) {
            this.char.setVelocityY(200);
        }
        
        if (this.isJumping && !this.char.anims.isPlaying) {
            this.char.anims.play('jump', true);
        } else if (onGround && !this.isJumping && !this.char.anims.isPlaying) {
            this.char.anims.play('idle', true);
        }
        
        // Store last Y position for next frame
        this.lastY = currentY;
    }
    
    loseLife() {
        // Reduce lives
        this.lives--;
        
        // Update display
        this.livesLabel.setText(`Lives: ${this.lives}`);
        
        // Reset player position
        this.char.setVelocity(0, 0);
        this.char.x = 200;
        this.char.y = 520;
        
        // Reset fall detection
        this.wasOnPlatform = false;
        
        // Check for game over
        if (this.lives <= 0) {
            this.scene.start('over-scene', { score: this.score });
            return;
        }
        
        // Flash the player to indicate damage
        this.tweens.add({
            targets: this.char,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                this.char.alpha = 1;
            }
        });
    }
    
    collectCoin(char, coin) {
        coin.destroy();
        this.score += 1;
        this.scoreLabel.setText(`Score: ${this.score}`);
        
        // Check if score reaches 7 to move to level 2
        if(this.score >= 7) {
            this.scene.start('level-2', { score: this.score, lives: this.lives });
        }
    }
}
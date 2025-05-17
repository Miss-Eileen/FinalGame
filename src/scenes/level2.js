import Phaser from "phaser"
export default class level2 extends Phaser.Scene {
    constructor() {
        super("level-2")
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
        this.isJumping = false; // Add this line
        this.background = undefined
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
        this.load.image("bg", "../../public/assets/kenney_background-elements-redux/Backgrounds/backgroundColorDesert.png")
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
    }

    update(time) {
        // Check if character is on the ground
        const onGround = this.char.body.touching.down || this.char.body.blocked.down;
        
        // Reset jump ability when landing
        if (onGround && this.isJumping) {
            this.isJumping = false;
            // Play idle animation when landing
            this.char.anims.play('idle', true);
        }
        
        // Handle left-right movement
        if (this.cursor.left.isDown) {
            this.char.setVelocityX(-200);
            this.char.setFlipX(true);
        } else if (this.cursor.right.isDown) {
            this.char.setVelocityX(200);
            this.char.setFlipX(false);
        } else {
            this.char.setVelocityX(0);
        }
        
        // Jump only if on ground and not already jumping
        if (this.cursor.up.isDown && onGround && !this.isJumping) {
            this.char.setVelocityY(-300);
            this.char.anims.play('jump', true);
            this.isJumping = true;
        }
        
        // Apply gravity when in air, but don't override jump velocity right away
        if (!onGround && this.char.body.velocity.y > -100) {
            // Only apply gravity when falling or at peak of jump
            this.char.setVelocityY(200);
        }
        
        // No need to constantly play jump animation
        if (this.isJumping && !this.char.anims.isPlaying) {
            this.char.anims.play('jump', true);
        } else if (onGround && !this.isJumping && !this.char.anims.isPlaying) {
            this.char.anims.play('idle', true);
        }
    }
    collectCoin(char,coin)
    {
        coin.destroy()
        this.score += 1;
        this.scoreLabel.setText(`Score: ${this.score}`);
    }

}
import Phaser from "phaser"
export default class level2 extends Phaser.Scene {
    constructor() {
        super("level-2")
    }

    init(data) {
        this.var = undefined
        this.xLemparan = undefined
        this.background = undefined
        this.platform = undefined
        this.char = undefined
        this.cursor = undefined
        this.ground = undefined
        this.coin = undefined
        this.jump = 0;
        
        // Set the score and lives from previous level
        this.score = data.score || 0;
        this.lives = data.lives || 3;
        
        this.scorelabel = undefined
        this.livesLabel = undefined
        this.isJumping = false;
        this.background = undefined
        
        // For fall detection
        this.wasOnPlatform = false;
        this.lastY = 0;
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
        // Use a different key for the level 2 background
        this.load.image("bg2", "../../public/assets/kenney_background-elements-redux/Backgrounds/backgroundColorForest.png")
        this.load.image("log", "../../public/assets/kenney_platformer-art-deluxe/BasePack/Tiles/bridgeLogs.png")
        this.load.image("platform", "../../public/assets/kenney_platformer-art-deluxe/BasePack/Tiles/bridge.png")
        this.load.image("coin", "../../public/assets/kenney_platformer-art-deluxe/BasePack/Items/coinGold.png")
    }

    createPlatform() {
        // Create platforms as a physics group (not static)
        this.platform = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });
        
        // Create coin group
        this.coin = this.physics.add.group({
            allowGravity: false
        });
        
        // Define platform positions with movement ranges
        const platformData = [
            { x: 120, y: 120, moveX: true, distance: 150, speed: 2000 },
            { x: 300, y: 180, moveX: false, distance: 100, speed: 2500 }, // up/down
            { x: 150, y: 240, moveX: true, distance: 200, speed: 3000 },
            { x: 380, y: 300, moveX: false, distance: 100, speed: 1800 }, // up/down
            { x: 90, y: 360, moveX: true, distance: 150, speed: 2200 },
            { x: 250, y: 420, moveX: false, distance: 80, speed: 2600 },  // up/down
            { x: 400, y: 480, moveX: true, distance: 180, speed: 2800 }
        ];
        
        // Create each platform with its coin
        platformData.forEach(data => {
            // Create the platform
            const platform = this.platform.create(data.x, data.y, "platform");
            platform.body.immovable = true;
            platform.body.allowGravity = false;
            
            // Create a coin and attach it to the platform
            const coin = this.coin.create(data.x, data.y - 35, "coin");
            
            // Add movement tween
            if (data.moveX) {
                // Horizontal movement
                this.tweens.add({
                    targets: [platform, coin],  // Move both platform and coin
                    x: platform.x + data.distance,
                    duration: data.speed,
                    yoyo: true,
                    repeat: -1
                });
            } else {
                // Vertical movement
                this.tweens.add({
                    targets: [platform, coin],  // Move both platform and coin
                    y: platform.y + data.distance,
                    duration: data.speed,
                    yoyo: true,
                    repeat: -1
                });
            }
        });
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
        // Remove this line - it's incorrect and doesn't do anything
        // this.load.image ('background')
        this.ground = this.physics.add.staticGroup()
        // Use the new key name "bg2" here
        this.background = this.add.image(240, 320, "bg2")
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
        this.physics.add.overlap(this.char, this.coin, this.collectCoin, null, this)
        
        // Create score label with carried over score
        this.scoreLabel = this.add.text(10, 10, `Score: ${this.score}`, {
            color: 'white',
            backgroundColor: 'black'
        }).setDepth(1);
        
        // Add lives display with carried over lives
        this.livesLabel = this.add.text(370, 10, `Lives: ${this.lives}`, {
            color: 'white',
            backgroundColor: 'black'
        }).setDepth(1);
    }

    update(time) {
        // Check if character is on the ground
        const onGround = this.char.body.touching.down || this.char.body.blocked.down;
        
        // Save current Y position
        const currentY = this.char.y;
        
        // Check if on platform (not the bottom ground)
        const onPlatform = onGround && currentY < 550;
        
        if (onPlatform) {
            this.wasOnPlatform = true;
        }
        
        // Fall detection - if player was on a platform then falls beyond Y threshold
        if (this.wasOnPlatform && !onGround && currentY > 550) {
            this.loseLife();
        }
        
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
        
        // Store last Y position for next frame
        this.lastY = currentY;
    }
    
    // Add the loseLife method
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
        
        // Check if total score reaches 14 (7 from level 1 + 7 from level 2)
        if(this.score >= 14) {
            this.scene.start('over-scene', { score: this.score });
        }
    }
}
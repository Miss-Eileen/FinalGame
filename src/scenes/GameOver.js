import Phaser from "phaser"
export default class GameOver extends Phaser.Scene {
    constructor(){
        super("over-scene")
    }
    init(data){
        this.replayButton = undefined
        this.score = data.score
        this.background = undefined
    }
    preload(){
        this.load.image("background","../../public/assets/kenney_background-elements-redux/Backgrounds/backgroundCastles.png")
        this.load.image("replayButton","../../public/assets/ReplayButtonFinalGgame1.png")
        this.load.image("gameover","../../public/assets/gameOverFinalGame1.png") 
    }
    create(){
        this.add.image(240,320,"background")
        this.add.image(240,320,"gameover").setScale(0.5)
        this.replayButton = this.add.image(240,400,"replayButton").setScale(0.2).setInteractive()
        this.replayButton.once(
            "pointerup",
            () => {
                this.scene.start("game-scene")
            },
            this
        )
    }

}
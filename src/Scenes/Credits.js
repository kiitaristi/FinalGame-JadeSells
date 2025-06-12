class Credits extends Phaser.Scene {
    constructor() {
        super("creditsScene");
    }

    create() {
        my.text.title = this.add.bitmapText(game.config.width/4 + 30, game.config.height/2 - 100, "rocketSquare", "FIREFLIGHT");
        my.text.title.setFontSize(45);
        my.text.title.setCenterAlign();

        my.text.credits = this.add.bitmapText(my.text.title.x - 20, my.text.title.y + 50, "rocketSquare",
            "Game by: Jade Sells\n Programming: Jade Sells\n Design: Jade Sells\n Character Assets: Jade Sells\n Map Assets: Kenney Assets\n\n Press S to Return"
        );
        my.text.credits.setFontSize(25);
        my.text.credits.setCenterAlign();

         // ...and pass to the next Scene
        this.input.keyboard.on('keydown-S', () => {
            this.scene.start("loadScene");
        }, this);
    }
}
class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    init() {
        my.sprite.bulletui.length = 0;
    }

    preload() {
        this.load.setPath("./assets/");

        this.load.atlas("finalgame_player_sprites", "finalgame_player_packed.png", "finalgame_player_packed.json");
        this.load.atlas("shoot_vfx_sprites", "shoot_vfx_packed.png", "shoot_vfx_packed.json");

        // Load tilemap information
        this.load.image("start_frame", "finalgame_player_0.png");
        this.load.image("ammoget_frame", "bulletget_vfx.png");
        this.load.image("ammoui_frame", "finalgame_bulletui.png");
        this.load.image("gun_sprite", "finalgame_gun.png");
        this.load.image("tilemap_tiles", "monochrome_tilemap_packed.png");
        this.load.image("tilemap_tiles_transparent", "monochrome_tilemap_transparent_packed.png");
        this.load.tilemapTiledJSON("finalgame-level", "finalgame-level.json");   // Tilemap in JSON

        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "monochrome_tilemap_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet("tilemap_sheet_transparent", "monochrome_tilemap_transparent_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
    }

    create() {
            this.anims.create({
            key: 'playerrun',
            defaultTextureKey: "finalgame_player_sprites",
            frames: [
                { frame: "finalgame_player_4.png" },
                { frame: "finalgame_player_5.png" },
                { frame: "finalgame_player_6.png" },
                { frame: "finalgame_player_3.png" }
            ],
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: 'playeridle',
            defaultTextureKey: "finalgame_player_sprites",
            frames: [
                { frame: "finalgame_player_1.png" },
                { frame: "finalgame_player_2.png" }
            ],
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'playerair',
            defaultTextureKey: "finalgame_player_sprites",
            frames: [
                { frame: "finalgame_player_0.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'shootvfx',
            defaultTextureKey: "shoot_vfx_sprites",
            frames: [
                { frame: "shoot_0.png" },
                { frame: "shoot_1.png" },
                { frame: "shoot_2.png" },
                { frame: "shoot_3.png" },
                { frame: "shoot_4.png" }
            ],
            frameRate: 25,
            repeat: -1
        });
        
        my.text.title = this.add.bitmapText(game.config.width/4 + 30, game.config.height/2 - 100, "rocketSquare", "FIREFLIGHT");
        my.text.title.setFontSize(45);
        my.text.title.setCenterAlign();

        my.text.controls = this.add.bitmapText(my.text.title.x - 20, my.text.title.y + 50, "rocketSquare",
            "Controls\n A/D: Move left/right\n Mouse: Aim\n Left Click: Launch\n\n Press S to start"
        );
        my.text.controls.setFontSize(25);
        my.text.controls.setCenterAlign();

        my.text.credits = this.add.bitmapText(my.text.title.x, my.text.controls.y + 200, "rocketSquare",
            "Game by: Jade Sells\n Programming: Jade Sells\n Design: Jade Sells\n Character Assets: Jade Sells\n Map Assets: Kenney Assets"
        );
        my.text.credits.setFontSize(15);
        my.text.credits.setCenterAlign();

         // ...and pass to the next Scene
        this.input.keyboard.on('keydown-S', () => {
            this.scene.start("platformerScene");
        }, this);   
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}
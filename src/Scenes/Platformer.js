class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");

        this.resetX;
        this.resetY;
        this.theta;
        this.respawnTimer = -1;
        this.levelEndTimer = -1;
        this.playerWin = false;
        this.song;
        this.victory;
        my.sprite.bulletui = [];
    }

    init() {
        // variables and settings
        this.physics.world.gravity.y = 1500;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 1.85;
        this.physics.world.drawDebug = false;
        this.physics.world.TILE_BIAS = 20;
        this.resetX = 70;
        this.resetY = 2200;
    }

    preload() {
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
        this.load.audio('song', 'assets/platformersong.mp3');
        this.load.audio('jumpaud', 'assets/platformerjump.wav');
    }

    create() {
        this.map = this.add.tilemap("finalgame-level", 16, 16, 50, 150);
        this.animatedTiles.init(this.map);

        // Pointer object to handle omnidirectional aiming
        this.mouse = this.input.activePointer;

        // Load sound files within the scene for use in the game
        this.song = this.sound.add('song', {
            volume: 0.25,
            loop: true
        });

        this.jumpSound = this.sound.add('jumpaud', {
            volume: 1.4,
            loop: false
        });

        // Add the map's tileset
        this.tileset = this.map.addTilesetImage("monochrome_tilemap_packed", "tilemap_tiles");

        // Create layers
        this.fullAlphaBGLayer = this.map.createLayer("FullAlphaBG", this.tileset, 0, 0);
        this.backgroundLayer = this.map.createLayer("BG", this.tileset, 0, 0);
        this.hazardsLayer = this.map.createLayer("Hazards", this.tileset, 0, 0);
        this.groundLayer = this.map.createLayer("Platforms", this.tileset, 0, 0);

        // Sets collisions for layers the player interacts with
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        this.hazardsLayer.setCollisionByProperty({
            collides: false
        });

        this.gem = this.map.createFromObjects("Gem", {
            name: "gem",
            key: "tilemap_sheet",
            frame: 102
        });

        this.checkpoints = this.map.createFromObjects("Checkpoints", {
            name: "checkpoint",
            key: "tilemap_sheet",
            frame: 77,
            activated: false
        });

        this.aKey = this.input.keyboard.addKey('A');
        this.dKey = this.input.keyboard.addKey('D');

        // Player object construction begins
        this.player = new Player(this, this.resetX, this.resetY, "finalgame_player_sprites", "finalgame_player_0.png");
        this.player.init(this.resetX, this.resetY, this.aKey, this.dKey);
        this.player.initPhysics(this.groundLayer, this.hazardsLayer, this.map);
        
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 1, 1); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        this.player.initCamera(this.cameras.main);
        this.player.initVFX(my.vfx);
        // Player object construction ends

        // Gun object construction begins
        this.gun = new Gun(this, 0, 0, "finalgame_player_sprites", "finalgame_gun.png");
        this.gun.init(this.player.x, this.player.y);
        this.gun.initVFX(my.vfx);
        // Gun object construction ends

        // Bullet UI, showing the player how much ammo they currently have
        for (let i = 0; i < this.gun.ammoMax; i++) {
            if (i == 0) {
                my.sprite.bulletui.push(this.add.sprite(this.player.x - 15, this.player.y - 10, "ammoui_frame", "finalgame_bulletui.png").setScale(0.3));
                my.sprite.bulletui[i].depth = 5;
                my.sprite.bulletui.visible = true;
            }
            else {
                my.sprite.bulletui.push(this.add.sprite(my.sprite.bulletui[i - 1] - 15, this.player.y - 10, "ammoui_frame", "finalgame_bulletui.png").setScale(0.3));
                my.sprite.bulletui[i].depth = 5;
                my.sprite.bulletui.visible = true;
            }
        }

        this.physics.world.enable(this.checkpoints, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.gem, Phaser.Physics.Arcade.STATIC_BODY);
        this.checkpointGroup = this.add.group(this.checkpoints);
        this.gemGroup = this.add.group(this.gem);
 
        this.physics.add.overlap(this.player, this.checkpointGroup, (obj1, obj2) => {
            if (!obj2.activated)
            {
                obj2.activated = true;
                this.gun.ammo = this.gun.ammoMax;
                this.gun.reloadTimer = 120;
                for (let bullet of my.sprite.bulletui) { bullet.alpha = 1; }
                this.player.playerResetX = obj2.x;
                this.player.playerResetY = obj2.y - 25;
                obj2.alpha *= 0.45;
            }
        });

        this.physics.add.overlap(this.player, this.gemGroup, (obj1, obj2) => {
            this.scene.restart();
            this.song.stop();
            this.scene.start("loadScene");
        });

        // Shooting system, which is handled in scene in order to easily pass variables between the Player and Gun 
        // objects for use in their respective class methods
        this.input.on('pointerdown', (pointer) => {
            if (this.gun.ammo > 0) {
                this.player.body.setVelocityY((-this.gun.SHOOT_VELOCITY) * Math.sin(this.theta));
                this.player.body.setVelocityX((-this.gun.SHOOT_VELOCITY * Math.cos(this.theta)) + this.player.body.velocity.x);

                this.jumpSound.play(); 
                console.log(this.player.body.velocity.x);
                console.log(this.player.body.velocity.y);

                this.gun.shootVFXHandler();
                my.sprite.bulletui[this.gun.ammo - 1].alpha = 0.3;
                this.gun.ammo--;
            }
        });
        
        // Debug key listener (assigned to Q key)
        this.input.keyboard.on('keydown-Q', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        this.song.play();
    }

    update() {
        // Update the Player object position and animations
        this.player.update(this.gun, my.sprite.bulletui);
        for (let i = 0; i < this.gun.ammoMax; i++) {
            if (i == 0) {
                my.sprite.bulletui[i].x = this.player.x - 12;
                my.sprite.bulletui[i].y = this.player.y - 10;
            }
            else {
                my.sprite.bulletui[i].x = my.sprite.bulletui[i - 1].x - 5;
                my.sprite.bulletui[i].y = this.player.y - 10;
            }
        }

        // Calculate angle of fire theta using player coordinates and mouse cursor coordinates
        //                                    | point 1 ->                 || point 2 ->                         |
        this.theta = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.mouse.worldX, this.mouse.worldY);
        this.gun.theta = this.theta;
        this.gun.playerCenterX = this.player.x;
        this.gun.playerCenterY = this.player.y;

        // Update the Gun object position and rotation
        this.gun.update();

        // Call upon the Gun object's reload handler in the case that it is below maximum ammo
        if (this.gun.ammo < this.gun.ammoMax) {
            this.gun.reloadHandler(this.player, my.sprite.bulletui);
        }

        // Flip the Player sprite on its x-axis given the player's angle of fire
        if (Phaser.Math.RadToDeg(this.theta) > 90 || Phaser.Math.RadToDeg(this.theta) < -90) { this.player.setFlip(true, false); }
        else { this.player.resetFlip(); }

        // Flip the Gun sprite on its y-axis given the player's angle of fire
        if (Phaser.Math.RadToDeg(this.theta) > 90 || Phaser.Math.RadToDeg(this.theta) < -90) { this.gun.setFlip(false, true); }
        else { this.gun.resetFlip(); }
    }
}
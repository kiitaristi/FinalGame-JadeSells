class Gun extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);

        return this;
    }

    init(playerX, playerY) {

        // Variables for later use in the Player class
        this.SHOOT_VELOCITY = 700;
        this.playerCenterX = playerX;
        this.playerCenterY = playerY;
        this.theta;
        this.ammo = 4;
        this.ammoMax = 4;
        this.reloadTimer = 120;
    }

    initVFX(particleEmitter) {
        this.vfx = particleEmitter;

        // Particle emitter that handles animated sprites
        this.vfx.shoot = this.scene.add.particles(20, -5, 'shoot_vfx_sprites', {
            anim: ['shootvfx'],
            depth: 0,
            scale: {start: 1.2, end: 1},
            maxAliveParticles: 1,
            stopAfter: 1,
            lifespan: 250,
            alpha: {start: 1, end: 0.5},
        });
    }

    create() {
        // Initialize the Gun sprite
        this.scene.add.sprite(this);
        this.depth = 3;
    }

    update() {
        // Continuously poll gun's position around player using sine and cosine, given angle theta and fixed radius r
        // gun.x = player.x + (r * cos(theta))
        // gun.y = player.y + (r * sin(theta))
            // The gun should now actively circle around player given the angle created by the player's mouse cursor
            // and the player's x and y coordinates       
        this.x = this.playerCenterX + (25 * Math.cos(this.theta));
        this.y = this.playerCenterY + (25 * Math.sin(this.theta));
        this.setRotation(this.theta);
    }

    // Ammunition system handler, in which when the player shoots, their gun automatically reloads over time
    reloadHandler(player, bullets) {
        if (this.reloadTimer <= 0) { 
                this.ammo++;
                player.ammoGetVFXHandler();
                bullets[this.ammo - 1].alpha = 1;
                this.reloadTimer = 120; 
            }
            
            this.reloadTimer--;
    }

    // Handler function for the shooting VFX
    shootVFXHandler() {
        // Continuously poll emitter's position around player using sine and cosine, given angle theta and fixed radius r
        // gun.x = player.x + (r * cos(theta))
        // gun.y = player.y + (r * sin(theta))
            // Particles now emit from a position relative to the gun, where they emit about 30 pixels out from the barrel,
            // and handles this for both sides
        this.vfx.shoot.x = this.playerCenterX + (55 * Math.cos(this.theta));
        this.vfx.shoot.y = this.playerCenterY + (55 * Math.sin(this.theta));;
        console.log(this.vfx.shoot.x);
        console.log(this.vfx.shoot.y);
        this.vfx.shoot.particleRotate = Phaser.Math.RadToDeg(this.theta);
        this.vfx.shoot.emitParticle(1);
    }
}
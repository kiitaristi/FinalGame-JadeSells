class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);

        return this;
    }

    init(resetX, resetY, leftKey, rightKey) {

        // Variables for later use in the Player class
        this.DEFAULT_ACCELERATION = 1200;
        this.DRAG = 2200;
        this.JUMP_VELOCITY = -600;
        this.MAX_DEFAULT_VELOCITY_X = 300;
        this.MAX_DEFAULT_VELOCITY_Y = 1500;
        this.playerResetX = resetX;
        this.playerResetY = resetY;
        this.left = leftKey;
        this.right = rightKey;
        this.playerDead = false;
        this.respawnTimer = -1;
    }

    initPhysics(groundLayer, hazardsLayer, map/*, checkpointGroup*/) {
        
        // Initialize the Player arcade physics sprite and the collisions it handles
        this.scene.physics.add.sprite(this);
        this.scene.physics.add.collider(this, groundLayer);
        this.hazards = hazardsLayer;
        this.level = map;

        this.arcadeBody = this.scene.physics.add.existing(this, 0);
    }

    initCamera(camera) {
        this.cam = camera;
    }

    initVFX(particleEmitter) {
        this.vfx = particleEmitter;

        this.vfx.ammoGet = this.scene.add.particles(0, 0, 'ammoget_frame', {
            depth: 0,
            scale: {start: 1, end: 0.5},
            maxAliveParticles: 1,
            lifespan: 300,
            stopAfter: 1,
            gravityY: 0,
            alpha: {start: 1, end: 0.5},
        });
    }

    create() {
        this.body.setCollideWorldBounds(false);
        this.setDisplaySize(32, 32);
        this.depth = 2;
    }

    update(gun, bullets) {
        
        // Code to handle how long it takes the player to respawn after hitting hazards
        this.respawnTimer--;
        if (this.respawnTimer <= 0 && this.playerDead) { this.playerRespawn(gun, bullets); }

        if(this.left.isDown) {

            // Acceleration code that allows the player to make the player turning around more snappy and less slidey
            if (this.body.velocity.x > 0) { 
                this.body.setAccelerationX(0);
                this.body.setDragX(this.DRAG); 
            }
            else if (this.body.velocity.x < -this.MAX_DEFAULT_VELOCITY_X) {
                this.body.setAccelerationX(0);
            }
            else {
                this.body.setAccelerationX(-this.DEFAULT_ACCELERATION);
                this.anims.play('playerrun', true);
            }

            // my.vfx.walking.startFollow(my.sprite.player, 0, 0, false);

            // my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // my.vfx.walking.start();
        } else if (this.right.isDown) {
            
            // Acceleration code that allows the player to make the player turning around more snappy and less slidey
            if (this.body.velocity.x < 0) { 
                this.body.setAccelerationX(0);
                this.body.setDragX(this.DRAG); 
            }
            else if (this.body.velocity.x > this.MAX_DEFAULT_VELOCITY_X) {
                this.body.setAccelerationX(0);
            }
            else {
                this.body.setAccelerationX(this.DEFAULT_ACCELERATION);
                this.anims.play('playerrun', true);
            }

            // my.vfx.walking.startFollow(my.sprite.player, 0, 0, false);

            // my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // my.vfx.walking.start();
        } else {
            this.body.setAccelerationX(0);
            this.body.setDragX(this.DRAG);
            this.anims.play('playeridle');

            // my.vfx.walking.stop();
        }

        // Continuously poll whether the player's position intersects with hazards, with some offset inwards from the edges
        // of the player sprite for some forgiveness
        if (this.level.getTileAtWorldXY(this.x + 10 - (this.displayWidth / 2), 
                this.y + 10 - (this.displayHeight / 2), false, this.cam, this.hazards)) { this.playerDeath(); }
        if (this.level.getTileAtWorldXY(this.x + this.displayWidth - 5 - (this.displayWidth / 2), 
                this.y + 10 - (this.displayHeight / 2), false, this.cam, this.hazards)) { this.playerDeath(); }
        if (this.level.getTileAtWorldXY(this.x + 10 - (this.displayWidth / 2), 
                this.y + this.displayHeight - 10 - (this.displayHeight / 2), false, this.cam, this.hazards)) { this.playerDeath(); }
        if (this.level.getTileAtWorldXY(this.x + this.displayWidth - 10 - (this.displayWidth / 2), 
                this.y + this.displayHeight - 10 - (this.displayHeight / 2), false, this.cam, this.hazards)) { this.playerDeath(); }

        if(!this.body.blocked.down) { 
            this.anims.play('playerair');
        }
    }

    // Handles the player respawning
    playerRespawn(gun, bullets) {
        this.playerDead = false;
        gun.ammo = gun.ammoMax;
        gun.reloadTimer = 120;
        for (let bullet of bullets) { bullet.alpha = 1; }
        this.x = this.playerResetX;
        this.y = this.playerResetY;
        this.scene.physics.world.gravity.y = 1500;
        this.visible = true;
        this.cam.startFollow(this, true, 1, 1);
    }

    // Handles when the player collides with hazards
    playerDeath() {
        this.visible = false;
        this.body.setVelocityX(0);
        this.body.setVelocityY(0);
        this.x = 0;
        this.y = 0;
        this.scene.physics.world.gravity.y = 0;
        this.cam.stopFollow();
        this.respawnTimer = 100;
        this.playerDead = true;
    }

    // Handler function for VFX that communicates when the player gets ammunition
    ammoGetVFXHandler() {
        this.vfx.ammoGet.startFollow(this, 0, -20, false);
        this.vfx.ammoGet.emitParticle(1);
    }
}
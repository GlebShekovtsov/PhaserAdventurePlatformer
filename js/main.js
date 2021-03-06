function Hero(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'hero');
    this.anchor.set(0.5, 0.5);
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
}
Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;
Hero.prototype.move = function (direction) {
    this.x += direction * 2.5;
    const SPEED = 200;
    this.body.velocity.x = direction * SPEED;
};
Hero.prototype.jump = function () {
    const JUMP_SPEED = 600;
    let canJump = this.body.touching.down;
    if (canJump) {
        
        this.body.velocity.y = -JUMP_SPEED;
    }
    return canJump;
};
PlayState = {};
PlayState.init = function () {
    this.game.renderer.renderSession.roundPixels = true;
    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        up: Phaser.KeyCode.UP
    });
    this.keys.up.onDown.add(function () {
        let didJump = this.hero.jump();
        if(didJump) {
            this.sfx.jump.play();
        }
    }, this);
};
PlayState.preload = function () {
    this.game.load.image('background', 'images/background.png');
    this.game.load.json('level:1', 'data/level01.json');
    this.game.load.image('ground', 'images/ground.png');
    this.game.load.image('grass:8x1', 'images/grass_8x1.png');
    this.game.load.image('grass:6x1', 'images/grass_6x1.png');
    this.game.load.image('grass:4x1', 'images/grass_4x1.png');
    this.game.load.image('grass:2x1', 'images/grass_2x1.png');
    this.game.load.image('grass:1x1', 'images/grass_1x1.png');
    this.game.load.image('hero', 'images/hero_stopped.png');
    this.game.load.audio('sfx:jump', 'audio/jump.wav');
    this.game.load.spritesheet('coin', 'images/coin_animated.png', 22,22);
    this.game.load.audio('sfx:coin', 'audio/coin.wav');
    this.game.load.spritesheet('spider', 'images/spider.png', 42, 32);
};
PlayState.create = function () {

    this.game.add.image(0, 0, 'background');
    this._loadLevel(this.game.cache.getJSON('level:1'));
    this.sfx = {
        jump: this.game.add.audio('sfx:jump '),
        coin: this.game.add.audio('sfx:coin')
    };

};
PlayState.update = function () {
    this._handleCollisions();
    this._handleInput();
};
PlayState._handleInput = function () {
    if (this.keys.left.isDown) {
        this.hero.move(-1);
    }
    else if (this.keys.right.isDown) {
        this.hero.move(1);
    }
    else {
        this.hero.move(0);
    }
};
PlayState._loadLevel = function (data) {
    this.platforms = this.game.add.group();
    this.coins = this.game.add.group(); 
    data.platforms.forEach(this._spawnPlatform, this);
    this._spawnCharacters({ hero: data.hero, spiders: data.spiders });
    data.coins.forEach(this._spawnCoin, this);
    const GRAVITY = 1200;
    this.game.physics.arcade.gravity.y = GRAVITY;
};
PlayState._spawnCoin = function (coin) {
    let sprite = this.coins.create(coin.x, coin.y, 'coin');
    sprite.anchor.set(0.5, 0.5);
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
    sprite.animations.add('rotate', [0,1,2,1], 6, true);
    sprite.animations.play('rotate');
};
PlayState._spawnPlatform = function (platform) {
    let sprite = this.platforms.create(platform.x, platform.y, platform.image);
    this.game.add.sprite(platform.x, platform.y, platform.image);
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
    sprite.body.immovable = true;
};
PlayState._spawnCharacters = function (data) {
    this.hero = new Hero(this.game, data.hero.x, data.hero.y);
    this.game.add.existing(this.hero);
};
PlayState._handleCollisions = function () {
    this.game.physics.arcade.collide(this.hero, this.platforms);
    this.game.physics.arcade.overlap(this.hero, this.coins, this._OnHeroVsCoin, null, this);
};
PlayState._OnHeroVsCoin = function (hero, coin) {
    this.sfx.coin.play();
    coin.kill();
}
window.onload = function () {
    let game = new Phaser.Game(960, 600, Phaser.Auto, 'game');
    game.state.add('play', PlayState);
    game.state.start('play');
};
window.addEventListener('DOMContentLoaded', () => {
    /* canvas setup */
    const canvas = this.document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 600;

    if (localStorage.length > 0) {
        let items = [];
        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            let value = localStorage.getItem(key);
            items.push({key: key, value: parseInt(value)});
        };
        items.sort((a, b) => b.value - a.value);
        let acc = '';
        for (let item of items) {
            acc += `${item.key} ${item.value} очков\n`;
        };
        document.getElementById('points').innerText = "Лучший результат \n" + acc;
    };
    class Modal {
        constructor(game) {
            this.game = game;
            this.name = document.getElementById('name').value;
            this.modal = document.getElementById('modal');
            this.btn = document.getElementById('btnSubmit');
            this.points = document.getElementById('points');
        }
        displayModal () {
            let name = document.getElementById('name').value;
            this.modal.style.display = 'flex';
            this.points.innerText = `Лучший результат ${localStorage.getItem(name)}`;
        }
        HideModal() {
            this.modal.style.display = 'none';
        }
    }
    class InputHandler {
        constructor(game) {
            this.game = game;
            window.addEventListener('keydown', e => {
                if ((e.key === 'w' ||
                e.key === 'a' ||
                e.key === 'd' ||
                e.key === 's') && this.game.keys.indexOf(e.key) === -1) {
                    this.game.keys.push(e.key);
                } 
            });
            window.addEventListener('keyup', e => {
                if (this.game.keys.indexOf(e.key) > -1) {
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
               }
            })
           
        }
    }
    class WallHit {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.frameX = 0;
            this.maxFrame = 8;
            this.width = 60;
            this.height = 60;
            this.timer = 0; 
            this.fps = 8;
            this.interval = 1000/this.fps;
            this.markedForDeletion = false;
            this.image = document.getElementById('explosionOnImpact');
        }
        update(deltaTime) {
            if (this.timer > this.interval) {
                this.frameX++;
                this.timer = 0;
            } else this.timer += deltaTime;
            if (this.frameX > this.maxFrame) this.markedForDeletion = true;
        }
        draw(context) {
            context.drawImage(this.image, this.frameX * this.width, 0, 
                this.width, this.height, this.x, this.y, this.width, this.height);
        }
    }
    class Sound {
        constructor(game) {
            this.game = game;
            this.fly1Sound = document.getElementById('fly1');
            this.fly2Sound = document.getElementById('fly2');
            this.CrashSound = document.getElementById('crash');
            this.CrashSound2 = document.getElementById('crash2');
            this.timer = 0;
            this.interval = 200;
        }
        playFly1() {
            this.fly1Sound.currentTime = 0;
            this.fly1Sound.play();
        }
        playFly2() {
            this.fly2Sound.currentTime = 0;
            this.fly2Sound.play();
        }
        PlayCrashSound() {
            const randomize = Math.random();
            if (randomize > 0.5) {
                this.CrashSound.currentTime = 0.2;
                this.CrashSound.play();
            } else {
                this.CrashSound2.currentTime = 0.2;
                this.CrashSound2.play();
            }
        }
    }
    class Pipes {
        constructor(game) {
            this.game = game;
            this.x = this.game.width;
            this.y = 0;
            this.speedX = 2;
            this.width = 60;
            this.height = 60;
            this.pipeBlocks = Math.floor(Math.random() * 4) + 1;
            this.pipeBlocksHeight = this.height * this.pipeBlocks;
            this.markedForDeletion = false;
            this.imageBody = document.getElementById('pipeBody');
            this.imageTop = document.getElementById('pipeTop');
            this.imageBottom = document.getElementById('pipeBottom');
            this.frameTopOrBottom = Math.floor(Math.random() * 3);
            this.framesBody = Array.from({length: this.pipeBlocks}, () => Math.floor(Math.random() * 6));
            this.pipeTopOrBottom = Math.random();
        }
        update() {
            this.x -= this.speedX;
            if (this.x + this.width < 0) this.markedForDeletion = true;
        }
        draw(context) {
            if (this.pipeTopOrBottom > 0.5) {
            // generating and drawing pipebody
            for (let i = 0; i < this.pipeBlocks; i++) {
                context.drawImage(this.imageBody, this.framesBody[i] * this.width, 0, 
                    this.width, this.height, this.x, this.y + i * this.height, this.width, this.height);
            };
            //generating and drawing pipe top
            context.drawImage(this.imageTop, this.frameTopOrBottom * this.width, 0, this.width, this.height, 
                this.x, this.y + this.pipeBlocks * this.height, this.width, this.height);
            } else {
            // generating and drawing pipebody
            for (let i = 0; i < this.pipeBlocks; i++) {
                context.drawImage(this.imageBody, this.framesBody[i] * this.width, 0, 
                    this.width, this.height, this.x, this.y + this.game.height - i * this.height, this.width, this.height);
            };
            //generating and drawing pipe bottom
            context.drawImage(this.imageBottom, this.frameTopOrBottom * this.width, 0, this.width, this.height, 
                this.x, this.y + this.game.height - this.pipeBlocks * this.height, this.width, this.height);
            };
        }
    }
    class player {
        constructor (game) {
            this.game = game;
            this.width = 60;
            this.height = 60;
            this.x = 40;
            this.y = 200;
            this.frameX = 0;
            this.maxFrame = 13;
            this.speedX = 0;
            this.maxSpeedX = 2
            this.speedY = 0;
            this.maxSpeedY = 4
            this.image = document.getElementById('bird');
            this.fps = 60;
            this.timer = 0;
            this.interval = 1000/this.fps;
        }
        update(deltaTime) {
            //player moving
            if (this.game.keys.includes('w')) {
                this.speedY = -this.maxSpeedY;
                this.game.sound.playFly1();
            }
            else if (this.game.keys.includes('s')) {
                this.speedY = this.maxSpeedY;
                this.game.sound.playFly2();
            }
            else this.speedY = 1;
            if (this.game.keys.includes('a')) this.speedX = -this.maxSpeedX;
            else if (this.game.keys.includes('d')) this.speedX = this.maxSpeedX;
            else this.speedX = 0;
            this.x += this.speedX;
            this.y += this.speedY;
            //sprite animation
            if (this.timer > this.interval) {
                if (this.frameX < this.maxFrame) {
                        this.frameX++;
                    } else {
                        this.frameX = 0;
                    }
                    this.timer = 0;
            } else {
                this.timer += deltaTime;
            };
            //player off screen 
            if (this.y + this.height >= this.game.height) {
                this.game.gameOver = true;
                this.y = this.game.height - this.height;
            };
            if (this.y <= 0) this.y = 0;
            if (this.x <= 0) this.x = 0;
            if (this.x >= this.game.width - this.width) this.x = this.game.width - this.width;
        }
        draw(context) {
            //player drawing
            context.drawImage(this.image, this.frameX * this.width, 0, 
                this.width, this.height, this.x, this.y, this.width, this.height);
        }
    }
    class Layer {
        constructor(game, image, speedModifier) {
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 120;
            this.height = 120;
            this.x = 0;
            this.y = this.game.height - this.height;
            this.landskapeBody = Array.from({length: 13}, () => Math.floor(Math.random() * 12));
        }
        update() {
            if (this.x <= -this.width * 13) this.x = 0;
            this.x -= this.game.speed * this.speedModifier;
        }
        draw(context) {
            for (let i = 0; i < this.landskapeBody.length; i++) {
                context.drawImage(this.image, this.landskapeBody[i] * this.width, 0, 
                    this.width, this.height, this.x + i * this.width, this.y, this.width, this.height);
                context.drawImage(this.image, this.landskapeBody[i] * this.width, 0, 
                    this.width, this.height, this.x + i * this.width + this.width * 13, this.y, this.width, this.height);
            }
        }
    }
    class LayerThree extends Layer {
        constructor(game, image, speedModifier) {
            super(game, image, speedModifier)
            this.image = image;
            this.speedModifier = speedModifier;
            this.height = 240;
            this.y = this.game.height - this.height * 1.05;
            this.landskapeBody = Array.from({length: 13}, () => Math.floor(Math.random() * 15));
        }
        draw(context) {
            for (let i = 0; i < this.landskapeBody.length; i++) {
                context.drawImage(this.image, this.landskapeBody[i] * this.width, 0, 
                    this.width, this.height, this.x + i * this.width, this.y, this.width, this.height);
                context.drawImage(this.image, this.landskapeBody[i] * this.width, 0, 
                    this.width, this.height, this.x + i * this.width + this.width * 13, this.y, this.width, this.height);
            }
        }
    }
    class Clouds extends Layer {
        constructor(game, image, speedModifier) {
            super(game, image, speedModifier);
            this.image = image;
            this.speedModifier = speedModifier;
            this.height = 100;
            this.width = 100;
            this.y = Array.from({length: 10}, () => Math.floor(Math.random() * this.game.height / 3));
            this.cloudsSpread = Array.from({length: 13}, () => Math.floor(Math.random() * 15));
        }
        draw(context) {
            for (let i = 0; i < this.cloudsSpread.length; i++) {
                context.drawImage(this.image, this.cloudsSpread[i] * this.width, 0, 
                    this.width, this.height, this.x + i * this.width, this.y[i], this.width, this.height);
                context.drawImage(this.image, this.cloudsSpread[i] * this.width, 0, 
                    this.width, this.height, this.x + i * this.width + this.width * 13, this.y[i], this.width, this.height);
            }
        }
    }
    class Sun extends Layer {
        constructor(game, image, speedModifier) {
            super(game, image, speedModifier);
            this.image = image;
            this.speedModifier = speedModifier;
            this.height = 60;
            this.width = 60;
            this.y = Math.random() * this.game.height / 4;
            this.x = Math.random() * this.game.width / 2 + this.game.width / 2 - 60;
            this.frameX = 0;
            this.maxFrame = 7;
            this.fps = 8;
            this.timer = 0;
            this.interval = 1000/this.fps;
        }
        update(deltaTime) {
            if (this.x <= -this.game.width) this.x = this.game.width;
            this.x -= this.game.speed * this.speedModifier;
            this.y += this.game.speed * this.speedModifier / 50;
            //sprite animation
            if (this.timer > this.interval) {
                if (this.frameX < this.maxFrame) {
                        this.frameX++;
                    } else {
                        this.frameX = 0;
                    }
                    this.timer = 0;
            } else {
                this.timer += deltaTime;
            };
        }
        draw(context) {
                context.drawImage(this.image, this.frameX * this.width, 0, 
                    this.width, this.height, this.x, this.y, this.width, this.height);
        }
    }
    class Background {
        constructor(game) {
            this.game = game;
            this.landskape = document.getElementById('landskape');
            this.three = document.getElementById('Three');
            this.clouds = document.getElementById('clouds');
            this.sun = document.getElementById('sun');
            this.layer1 = new Layer(this.game, this.landskape, 1);
            this.layer2 = new LayerThree(this.game, this.three, 1);
            this.layer3 = new Clouds(this.game, this.clouds, 0.5);
            this.layer4 = new Sun(this.game, this.sun, 0.1);
            this.layers = [this.layer2, this.layer1, this.layer3, this.layer4];
        }
        update(deltaTime) {
            this.layers.forEach(layer => layer.update(deltaTime));
        }
        draw(context) {
             this.layers.forEach(layer => layer.draw(context));
        }
    }
    class UI {
        constructor(game) {
            this.game = game;
            this.fontSize = this.game.height/20;
            this.fontFamily = 'Roboto';
            this.color = 'red';
        }
        draw(context) {
            context.save();
            context.font = this.fontSize + 'px ' + this.fontFamily;
            context.fillStyle = this.color;
            context.fillText('score: ' + this.game.score, this.game.width / 100, this.game.height / 30 + 10);
            if (this.game.gameOver) {
                context.textAlign = 'center';
                context.font = this.fontSize + 'px ' + this.fontFamily;
                context.fillText('Игра окончена со счётом ' + this.game.score, this.game.width * 0.5, this.game.height * 0.5 - this.game.height/20);
            }
            context.restore();
        }
    }
    class Game {
        constructor (width, height) {
            this.width = width;
            this.height = height;
            this.background = new Background(this);
            this.player = new player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.sound = new Sound();
            this.modal = new Modal();
            this.keys = [];
            this.pipes = [];
            this.pipeTimer = 0;
            this.pipeInterval = 1500;
            this.gameOver = false;
            this.speed = 1;
            this.wallHits = [];
            this.score = 0;
        }
        update(deltaTime) {
            //background update
            this.background.update(deltaTime);
            //updating player movementwd
            this.player.update(deltaTime);
            //updating pipes
            this.pipes.forEach(pipe => {
                pipe.update();
                if (this.checkCollision(this.player, pipe)){
                    pipe.markedForDeletion = true;
                    this.addWallhit(this.player);
                    this.gameOver = true;
                    this.sound.PlayCrashSound();
                    this.modal.displayModal(this.modal.name);
                }
                if (this.checkScore(this.player, pipe)){
                    if (!this.gameOver) this.score++;
                }
            });
            this.pipes = this.pipes.filter(pipe => !pipe.markedForDeletion);
            if (this.pipeTimer > this.pipeInterval && !this.gameOver) {
                this.addPipe();
                this.pipeTimer = 0;
                this.pipeInterval = Math.floor(Math.random() * 10 + 3) * 100;
            } else {
                this.pipeTimer += deltaTime;
            }
            //updating wallhit
            this.wallHits.forEach(wallhit => wallhit.update(deltaTime));
            this.wallHits = this.wallHits.filter(wallhit => !wallhit.markedForDeletion);
            //save to local storage
            if (this.gameOver) this.saveTolocalStorage();
        }
        draw(context) {
            this.background.draw(context);
            this.player.draw(context);
            this.pipes.forEach(pipe => {
                pipe.draw(context);
            });
            this.wallHits.forEach(wallhit => {
                wallhit.draw(context);
            });
            this.ui.draw(context);
        }
        addPipe() {
            let newPipe = new Pipes(this);
            newPipe.passed = false;
            this.pipes.push(newPipe);
        }
        addWallhit(player) {
            this.wallHits.push(new WallHit(this, player.x, player.y));
        }
        checkCollision(player, object) {
            if (object.pipeTopOrBottom > 0.5) {
                // Collision detection for top pipes
                return (
                    player.x < object.x + object.width &&
                    player.x + player.width > object.x &&
                    player.y < object.y + object.pipeBlocksHeight + object.height / 2 &&
                    player.y + player.height > object.y
                );
            } else {
                // Collision detection for bottom pipes
                return (
                    player.x < object.x + object.width &&
                    player.x + player.width > object.x &&
                    player.y < object.y + object.game.height &&
                    player.y + player.height > object.y + object.game.height - object.pipeBlocksHeight + object.height / 2
                );
            }
        }
        checkScore(player, object) {
            //check passing a pipe obstacle
            if (
                !object.passed &&
                player.x < object.x + object.width &&
                player.x + player.width > object.x
            ) {
                object.passed = true;
                return true;
            }
            return false;
        }
        saveTolocalStorage() {
            const name = document.getElementById('name').value;
            if (!localStorage.getItem(name) || this.score > parseInt(localStorage.getItem(name))) {
                localStorage.setItem(name, this.score.toString());
            }
        }
    }

    let game = new Game(canvas.width, canvas.height);
    let lastTime = 0;
    let timer = 0;
    let animationId;
     // animation loop
    const animate = (timeStamp) => {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0,0,canvas.width,canvas.height)
        game.draw(ctx);
        game.update(deltaTime);
        if (game.gameOver) {
            timer += deltaTime;
            if (timer > 1500) {
                cancelAnimationFrame(animationId);
                return;
            }
        };
        animationId = requestAnimationFrame(animate);
    }
    document.getElementById('btnSubmit').addEventListener('click', () => {
        if (game.gameOver) {
            game = new Game(canvas.width, canvas.height); // restart the game
            timer = 0; // reset timer
        }
        game.modal.HideModal();
        animate(0); // start the animation loop
    });

}) // end of DOMContentLoaded function.
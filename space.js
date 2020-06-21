let rectWidth, rectHeight, caveArray, explosionArray, x, y, x2, y2, playerX, playerY, playerWidth, playerHeight, playerVelY, playerVelX, playerVelYMod, playerVelXMod,
    dx, enemyX, enemyY, missileX, missileY, missileWidth, missileHeight, missileVelX, fireAgain, startNow, previousTime, deltaTime, txt1, txt2, explosionDX, score, 
    scoreCounter, difficultyCounter;

// Game sounds

let gamestartSound = new Audio("Sounds/gamestart.mp3");
let explosionSound = new Audio("Sounds/explosion.mp3");
let playerloseSound = new Audio("Sounds/playerlose.mp3");
let shootSound = new Audio("Sounds/shoot.mp3");
let wallhitSound = new Audio("Sounds/wallhit.mp3");

let hiScore = 0;

let animateFirst = true;

window.onload = function() {
    canvas = document.getElementById("space-canvas");
    c = canvas.getContext("2d");
    canWidth = canvas.width;
    canHeight = canvas.height;

    // Used for centering text and stuff

    txt1 = "Space Cave";
    txt2 = "Press Enter to start";
    txt3 = "Use arrow keys to move and space to shoot";
    txt4 = "Game Over";
    txt5 = "Press Enter to play again";
    txt6 = "Hi-Score ";

    titleScreen();
}

function titleScreen () {
    c.beginPath();
    c.fillStyle = "Green";
    c.font = "50px 'Press Start 2P'";
    c.fillText(txt1, (canWidth / 2) - (c.measureText(txt1).width / 2), 230);
    c.closePath();

    c.beginPath();
    c.fillStyle = "White";
    c.font = "15px 'Press Start 2P'";
    c.fillText(txt2, (canWidth / 2) - (c.measureText(txt2).width / 2), 285);

    c.beginPath();
    c.fillStyle = "White";
    c.font = "10px 'Press Start 2P'";
    c.fillText(txt3, (canWidth / 2) - (c.measureText(txt3).width / 2), 340);

    startNow = true; // Allows you to call start() by pressing enter
}

class Rectangle {
    constructor(x, y, rectHeight) { // Makes a new cave rectangle
        this.x = x;
        this.y = y;
        this.rectHeight = rectHeight
        this.showEnemy = true;
    }

    draw() {
        x2 = this.x;
        y2 = this.y + this.rectHeight + 200;

        c.beginPath();
        c.rect(this.x, this.y, rectWidth, this.rectHeight);
        c.rect(x2, y2, rectWidth, 400);
        c.lineWidth = 3;
        c.strokeStyle = "green";
        c.stroke();
        c.fillStyle = "green";
        c.fill();
        c.closePath();

        if (this.rectHeight > 140 && this.showEnemy == true) { // Checks whether enemies should be drawn, then draws them

            enemyX = this.x + rectWidth / 2;
            enemyY = this.y + 50 + this.rectHeight;

            c.beginPath();
            c.rect(enemyX, enemyY, 10, 10);
            c.fillStyle = "red";
            c.fill();
            c.closePath();

            this.enemyHitDetection(); // Checks for hit detection on enemy if it exists
        }

    }

    update() { // Moves rectangles left to simulate scrolling
        
        this.rectangleHitDetection(); // Checks for hit detection on rectangles every update

        this.x += dx * deltaTime;

        if (this.x + rectWidth <= 0) { // Checks if rectangle reached left of screen, then moves it to the right and generates new height
            this.x = 850 - Math.abs(this.x + rectWidth); // Has to account for deltaTime error if rectangle moves into negative
            this.rectHeight = rectHeightRand();
            this.showEnemy = true;
        }

        this.draw();
    }

    rectangleHitDetection() { // Handles hit detection for the cave rectangles

        // Hit detection for player

        if (showPlayer == true) {
            if ((playerX > this.x) && (playerX < this.x + rectWidth) || (playerX + playerWidth > this.x) && (playerX + playerWidth < this.x + rectWidth)) { // Between rectangle
                if ((playerY < this.y + this.rectHeight) || playerY + playerHeight > this.rectHeight + 200) { // Hit either top or bottom rectangle
                    gameOver();
                }
            }
        }

        // Hit detection for missile

        if (fireAgain == false) {
            if ((missileY > this.y) && (missileY < this.y + this.rectHeight) || (missileY + missileHeight > this.y) && (missileY + missileHeight < this.y + this.rectHeight)) {
                if (missileX > this.x) {
                    fireAgain = true;
                    explosionArray.push(new Explosion(missileX, missileY, "white", 2));
                    wallhitSound.play();
                }
            } else if ((missileY > y2) && (missileY < y2 + this.rectHeight) || (missileY + missileHeight > y2) && (missileY + missileHeight < y2 + this.rectHeight)) {
                if (missileX > x2) {
                    fireAgain = true;
                    explosionArray.push(new Explosion(missileX, missileY, "white", 2));
                    wallhitSound.play();
                }
            }
        }
    }

    enemyHitDetection() { // Handles hit detection for the enemies

        // Hit detection for player
        
        if (showPlayer == true) {
            if ((enemyX > playerX) && (enemyX < playerX + playerWidth) || (enemyX + 10 > playerX) && (enemyX + 10 < playerX + playerWidth)) {
                if ((enemyY > playerY) && (enemyY < playerY + playerHeight) || (enemyY + 10 > playerY) && (enemyY + 10 < playerY + playerHeight)) {
                    gameOver();
                }
            }
        }
        
        // Hit detection for missile

        if (fireAgain == false) {
            if ((missileY > enemyY - 10) && (missileY < enemyY + 20) || (missileY + missileHeight > enemyY - 10) && (missileY + missileHeight < enemyY + 20)) {
                if (missileX > enemyX && playerX < enemyX) {
                    fireAgain = true;
                    this.showEnemy = false;
                    explosionArray.push(new Explosion(enemyX, enemyY, "red", 5));
                    explosionArray.push(new Explosion(missileX, missileY, "white", 2));
                    explosionSound.play();
                    scoreCounter += 1;
                }
            }
        }
    }
}

class Explosion { // Class for the explosions (when enemy or player die)
    constructor (expX, expY, expColor, shrapSize) {
        this.expX = expX;
        this.expY = expY;
        this.expColor = expColor;
        this.shrapSize = shrapSize

        // Sets size and position of shrapnel

        this.shrapX1 = this.expX;
        this.shrapY1 = this.expY;
        this.shrapX2 = this.expX + this.shrapSize;
        this.shrapY2 = this.expY;
        this.shrapX3 = this.expX;
        this.shrapY3 = this.expY + this.shrapSize;
        this.shrapX4 = this.expX + this.shrapSize;
        this.shrapY4 = this.expY + this.shrapSize;

        this.shrapDX1 = -Math.random() * explosionDX;
        this.shrapDY1 = Math.random() * explosionDX;
        this.shrapDX2 = Math.random() * explosionDX;
        this.shrapDY2 = Math.random() * explosionDX;
        this.shrapDX3 = -Math.random() * explosionDX;
        this.shrapDY3 = -Math.random() * explosionDX;
        this.shrapDX4 = Math.random() * explosionDX;
        this.shrapDY4 = -Math.random() * explosionDX;

        this.explosionDone = false;
    }

    drawExplosion() {
        c.beginPath();
        c.rect(this.shrapX1, this.shrapY1, this.shrapSize, this.shrapSize);
        c.rect(this.shrapX2, this.shrapY2, this.shrapSize, this.shrapSize);
        c.rect(this.shrapX3, this.shrapY3, this.shrapSize, this.shrapSize);
        c.rect(this.shrapX4, this.shrapY4, this.shrapSize, this.shrapSize);
        c.fillStyle = this.expColor;
        c.fill();
        c.closePath();

        if (this.shrapY1 > 500 || this.shrapY2 > 500) { // Trigger explosion being done after shrapnel is out of view
            this.explosionDone = true;
        }
    }

    updateExplosion() {

        // 4 pieces of shrapnel fly in opposite directions

        this.shrapX1 += this.shrapDX1 * deltaTime;
        this.shrapY1 += this.shrapDY1 * deltaTime;
        this.shrapX2 += this.shrapDX2 * deltaTime;
        this.shrapY2 += this.shrapDY2 * deltaTime;
        this.shrapX3 += this.shrapDX3 * deltaTime;
        this.shrapY3 += this.shrapDY3 * deltaTime;
        this.shrapX4 += this.shrapDX4 * deltaTime;
        this.shrapY4 += this.shrapDY4 * deltaTime;

        this.drawExplosion();

    }
}

function start() { // Generates starting values and initial array of identical rectangles 
    previousTime = performance.now();
    deltaTime = 0;
    rectWidth = 50;
    rectHeight = 100;
    caveArray = [];
    explosionArray = [];
    x = 0;
    y = 0;
    playerX = 100;
    playerY = 250;
    playerWidth = 30;
    playerHeight = 10;
    playerVelY = 0;
    playerVelX = 0;
    playerVelYMod = 200;
    playerVelXMod = 200;
    dx = -250;
    enemyX;
    enemyY;
    missileX;
    missileY;
    missileWidth = 15;
    missileHeight = 2;
    missileVelX = 0;
    fireAgain = true;
    startNow = false;
    showPlayer = true;
    explosionDX = 900;
    score = 0;
    scoreCounter = 0;
    difficultyCounter = 0;
    

    for (let i = 0; i < 18; i++) {

        caveArray.push(new Rectangle(x, y, rectHeight)); // Pushes each new rectangle into caveArray

        x += rectWidth; // Makes it so that each new rectangle is put next to the one before

        caveArray[i].draw(); // Calls draw() on each new rectangle
    }

    // Need to do this because animate() never stops after the first time, calling it here again would result in calling it twice in one frame
    
    if (animateFirst == true) {
        animate(); // Initiates animation
    }

    animateFirst = false;

    gamestartSound.play();

}

function fire() { // For firing missile shot

    if (showPlayer == true) {
        if (fireAgain == true) { // If the missile has landed on something, player can fire again
            missileVelX = 600;
    
            missileX = playerX;
            missileY = playerY + (playerHeight / 2) - (missileHeight / 2);

            shootSound.play();
    
            missile();
    
            fireAgain = false; // Missile is currently traveling so player can't fire again until it lands
        }
    }
}

function missile() {
    if (showPlayer == true) {
        c.beginPath();
        c.rect(missileX, missileY, missileWidth, missileHeight);
        c.fillStyle = "white";
        c.fill();
        c.closePath();

        missileX += missileVelX * deltaTime;

        if (missileX > 850) { // If missle reaches end of screen, player can fire again
            fireAgain = true;
    }
    }
}

function rectHeightRand() { // Function for generating random rectangle height
    if (rectHeight <= 100) { // Height is less than 100, increase it by a random factor
        return rectHeight += Math.random() * 100;
    } else { // Height is more than 100, decrease it by a random factor
         return rectHeight -= Math.random() * 100;
    }
}

function playerCraft() { // Player spaceship drawing and animation

    if (showPlayer == true) {
        c.beginPath();
        c.moveTo(playerX, playerY);
        c.lineTo(playerX + playerWidth, playerY + playerHeight / 2);
        c.lineTo(playerX, playerY + playerHeight);
        c.lineTo(playerX, playerY); 
        c.fillStyle = "blue";
        c.fill();
        c.closePath();

        if (playerX + playerWidth > canWidth) {
            playerX = canWidth - playerWidth;
        } else if (playerX < 0) {
            playerX = 0;
        }
    
        playerX += playerVelX * deltaTime;
        playerY += playerVelY * deltaTime;
    }
}

function gameOver() { // Player loses, obscures space ship and generates explosion for player
    showPlayer = false;
    explosionArray.push(new Explosion(playerX, playerY, "blue", 10));

    startNow = true; // Allows you to restart the game via pressing enter

    fireAgain = false;

    playerloseSound.play();
}

function move(e) { 

    switch (e.keyCode) {
        case 40: // Move up
            playerVelY = playerVelYMod;
            break;
    
        case 38: // Move down
            playerVelY = playerVelYMod * -1;
            break;

        case 39: // Move right
            playerVelX = playerVelXMod;
            break;

        case 37: // Move left
            playerVelX = playerVelXMod * -1;
            break

        case 32: // Shoot
            fire();
            break

        case 13: // Start game
            if (startNow == true) {
                start();
            }
            break
    }
}

function stop(e) {
    if (e.keyCode == 40) { // Stop moving up
        if (playerVelY == playerVelYMod) {
            playerVelY -= playerVelYMod;
        }
    }
    if (e.keyCode == 38) { // Stop moving down
        if (playerVelY == playerVelYMod * -1) {
            playerVelY += playerVelYMod;
        }
    }
    if (e.keyCode == 39) { // Stop moving right
        if (playerVelX == playerVelXMod) {
            playerVelX -= playerVelXMod;
        }
    }
    if (e.keyCode == 37) { // Stop moving left
        if (playerVelX == playerVelXMod * -1) {
            playerVelX += playerVelXMod;
        }
    }
}

function scoreKeeper() { // Tracks scores, increases difficulty, and shows game over screen

    if (showPlayer == true) {
        if (scoreCounter == 1) { // scoreCounter gets incremented every enemy killed, adds 5 to score and increases speed of rectangles by 1
            scoreCounter = 0;
            score += 5;
            dx -= 1;

            if (score > hiScore) { // Check for high score update
                hiScore = score;
            }
        }
    } else { // If showPlayer isn't true, player lost and show game over
        c.beginPath();
        c.fillStyle = "White";
        c.font = "50px 'Press Start 2P'";
        c.fillText(txt4, (canWidth / 2) - (c.measureText(txt4).width / 2), 230);
        c.closePath();

        c.beginPath();
        c.fillStyle = "White";
        c.font = "15px 'Press Start 2P'";
        c.fillText(txt5, (canWidth / 2) - (c.measureText(txt5).width / 2), 285);
    }

    // Score counter UI

    c.beginPath();
    c.fillStyle = "White";
    c.font = "15px 'Press Start 2P'";
    c.fillText("Score: " + score, 20, 480);
    c.closePath();

    c.beginPath();
    c.fillStyle = "White";
    c.font = "15px 'Press Start 2P'";
    c.fillText(txt6 + hiScore, canWidth - (c.measureText(txt6).width + c.measureText(hiScore).width) - 20, 480);
    c.closePath();

}

function animate() {

    let currentTime = performance.now();
    deltaTime = (currentTime - previousTime) / 1000;

    requestAnimationFrame(animate);

    c.clearRect(0, 0, canvas.width, canvas.height);

    for (let n = 0; n < 18; n++) { // Animate each rectangle's movement in caveArray()
        caveArray[n].update();
    }

    if (fireAgain == false) { // When missile is fired, call missile() every frame
        missile();
    }

    for (let m = 0; m < explosionArray.length; m++) { // For animating the explosions
        
        if (explosionArray[m].explosionDone == true) { // Once the explosion is done, it deletes it from explosionArray()
            explosionArray.splice(m, 1);
        } else {
            explosionArray[m].updateExplosion(); // Otherwise keep animating it
        }   
    }

    playerCraft();

    scoreKeeper();

    previousTime = currentTime;
    
}

document.onkeydown = move;
document.onkeyup = stop;


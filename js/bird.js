// ===== NAVIGATION =====
function goToPage(page) {
    window.location.href = page;
}

// ===== GAME VARIABLES =====
var myGamePiece;
var pipes = [];

var score = 0;
var highScore = localStorage.getItem("birdHighScore") || 0;

var gravity = 0.4;
var velocity = 0;

var gameState = "menu";

// ===== INPUT FIX =====
let lastFlapTime = 0;

// ===== OVERLAY =====
var overlay = document.getElementById("overlay");
var overlayText = document.getElementById("overlayText");

// ===== ANIMATION =====
let wingFrame = 0;
let wingDirection = 1;

// ===== CLOUDS =====
let clouds = [];

// ===== SCORE UI =====
function updateScoreUI() {
    var scoreEl = document.getElementById("score");
    var highScoreEl = document.getElementById("highScore");

    if (scoreEl) scoreEl.textContent = score;
    if (highScoreEl) highScoreEl.textContent = highScore;
}

// ===== CLOUDS =====
function createClouds() {
    clouds = [];

    for (let i = 0; i < 5; i++) {
        clouds.push({
            x: Math.random() * 600,
            y: Math.random() * 150,
            speed: 0.5 + Math.random() * 0.5
        });
    }
}

// ===== START GAME =====
function startGame() {
    createClouds();
    gameState = "playing";
    myGameArea.start();
    updateScoreUI();
}

// ===== RESTART GAME =====
function restartGame() {
    pipes = [];
    score = 0;
    velocity = 0;
    gameState = "playing";

    overlay.style.display = "none";

    updateScoreUI();
    createClouds();
    myGameArea.start();
}

// ===== GAME AREA =====
var myGameArea = {
    canvas: document.createElement("canvas"),
    context: null,
    interval: null,

    start: function () {
        if (this.interval) clearInterval(this.interval);

        this.canvas.width = 600;
        this.canvas.height = 400;

        this.context = this.canvas.getContext("2d");

        const container = document.getElementById("gameContainer");
        container.innerHTML = "";
        container.appendChild(this.canvas);

        myGamePiece = new component(30, 30, "yellow", 50, this.canvas.height / 2);

        this.interval = setInterval(updateGameArea, 20);
    },

    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    stop: function () {
        if (this.interval) clearInterval(this.interval);

        gameState = "gameover";

        // update high score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("birdHighScore", highScore);
        }

        updateScoreUI();

        overlay.style.display = "block";
        overlayText.innerHTML = "Game Over<br>Score: " + score;
    }
};

// ===== BIRD =====
function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;

    this.update = function () {
        let ctx = myGameArea.context;

        ctx.save();

        let centerX = this.x + this.width / 2;
        let centerY = this.y + this.height / 2;
        ctx.translate(centerX, centerY);

        let tilt = velocity * 0.05;
        if (tilt > 1) tilt = 1;
        if (tilt < -1) tilt = -1;

        ctx.rotate(tilt);

        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(5, -5, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(-25, wingFrame - 5);
        ctx.lineTo(-5, 15);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(25, -3);
        ctx.lineTo(15, 5);
        ctx.fill();

        ctx.restore();
    };
}

// ===== PIPE =====
function createPipe() {
    let gap = 120;

    let min = 50;
    let max = myGameArea.canvas.height - gap - 50;

    let topHeight = Math.random() * (max - min) + min;

    pipes.push({
        x: myGameArea.canvas.width,
        top: topHeight,
        bottom: topHeight + gap,
        passed: false
    });
}

// ===== CLOUDS =====
function drawCloud(cloud) {
    let ctx = myGameArea.context;

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, 20, 0, Math.PI * 2);
    ctx.arc(cloud.x + 20, cloud.y + 10, 25, 0, Math.PI * 2);
    ctx.arc(cloud.x - 20, cloud.y + 10, 25, 0, Math.PI * 2);
    ctx.fill();
}

// ===== LOOP =====
function updateGameArea() {
    myGameArea.clear();

    let ctx = myGameArea.context;

    // clouds
    for (let cloud of clouds) {
        cloud.x -= cloud.speed;

        if (cloud.x < -60) {
            cloud.x = myGameArea.canvas.width + 60;
            cloud.y = Math.random() * 150;
        }

        drawCloud(cloud);
    }

    if (gameState !== "playing") {
        myGamePiece.update();
        return;
    }

    velocity += gravity;
    myGamePiece.y += velocity;

    wingFrame += wingDirection * 0.8;
    if (wingFrame > 10 || wingFrame < -10) wingDirection *= -1;

    if (
        myGamePiece.y < 0 ||
        myGamePiece.y + myGamePiece.height > myGameArea.canvas.height
    ) {
        myGameArea.stop();
        return;
    }

    if (pipes.length === 0 || pipes[pipes.length - 1].x < 250) {
        createPipe();
    }

    for (let pipe of pipes) {
        pipe.x -= 2;

        ctx.fillStyle = "green";
        ctx.fillRect(pipe.x, 0, 50, pipe.top);
        ctx.fillRect(pipe.x, pipe.bottom, 50, myGameArea.canvas.height - pipe.bottom);

        if (
            myGamePiece.x < pipe.x + 50 &&
            myGamePiece.x + myGamePiece.width > pipe.x &&
            (myGamePiece.y < pipe.top ||
                myGamePiece.y + myGamePiece.height > pipe.bottom)
        ) {
            myGameArea.stop();
            return;
        }

        if (!pipe.passed && pipe.x + 50 < myGamePiece.x) {
            score++;

            if (score > highScore) {
                highScore = score;
                localStorage.setItem("birdHighScore", highScore);
            }

            updateScoreUI();
            pipe.passed = true;
        }
    }

    pipes = pipes.filter(p => p.x > -50);


    myGamePiece.update();
}

// ===== CONTROLS =====
function flap() {
    let now = Date.now();

    if (now - lastFlapTime < 150) return;
    lastFlapTime = now;

    if (gameState === "menu") {
        gameState = "playing";
        return;
    }

    if (gameState === "playing") {
        velocity = -6;
    }
}

document.addEventListener("keydown", function (e) {
    if (e.code === "Space") flap();
});

document.addEventListener("pointerdown", function () {
    flap();
});

// ===== INIT =====
startGame();
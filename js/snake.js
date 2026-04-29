// ===== NAVIGATION =====
function goToPage(page) {
    window.location.href = page; 
}

// ===== GAME VARIABLES =====
var grid = 20; 
var snake; 
var food;  
var velocityX = grid; 
var velocityY = 0;   
var nextVelocityX = grid; 
var nextVelocityY = 0;    
var gameState = "menu"; 

// ===== OVERLAY =====
var overlay = document.getElementById("overlay"); 
var overlayText = document.getElementById("overlayText"); 


// ===== SCORE =====
var score = 0;
var highScore = localStorage.getItem("snakeHighScore") || 0;
var gameInterval;  

function updateScoreUI() {
	var scoreEl = document.getElementById("score");
	var highScoreEl = document.getElementById("highScore");
    if (scoreEl) scoreEl.textContent = score;
    if (highScoreEl) highScoreEl.textContent = highScore;
}
// ===== START GAME =====
function startGame() {
    if (gameInterval) clearInterval(gameInterval); 

    myGameArea.start(); 
    resetGame();        

    gameState = "playing"; 

    // Faster update loop (70ms per frame)
    gameInterval = setInterval(updateGameArea, 70);
}

// ===== RESTART GAME =====
function restartGame() {
    overlay.style.display = "none"; 

    if (gameInterval) clearInterval(gameInterval); 

    resetGame(); 
    gameState = "playing"; 

    gameInterval = setInterval(updateGameArea, 70); 
}

// ===== GAME OVER =====
function gameOver() {
    clearInterval(gameInterval); 
    gameState = "gameover"; 

    
    overlay.style.display = "block";
    overlayText.innerHTML = "Game Over<br>Score: " + score
}

// ===== RESET GAME =====
function resetGame() {
    
    snake = [
        { x: 200, y: 200 },
        { x: 180, y: 200 },
        { x: 160, y: 200 }
    ];

    // Reset movement
    velocityX = grid;
    velocityY = 0;

    // Reset buffered input
    nextVelocityX = grid;
    nextVelocityY = 0;

    score = 0; 
	updateScoreUI();


    spawnFood(); 
}

// ===== SAFE FOOD SPAWN (AVOIDS SPAWNING ON SNAKE) =====
function spawnFood() {
    let valid = false; 

    while (!valid) {
        let newFood = {
          
            x: Math.floor(Math.random() * (600 / grid)) * grid,
            y: Math.floor(Math.random() * (400 / grid)) * grid
        };

        valid = true; 

    
        for (let part of snake) {
            if (part.x === newFood.x && part.y === newFood.y) {
                valid = false; 
                break;
            }
        }

        if (valid) food = newFood; 
    }
}

// ===== GAME AREA  =====
var myGameArea = {
    canvas: document.createElement("canvas"), 
    context: null, 

    start: function () {
        this.canvas.width = 600;  
        this.canvas.height = 400; 

        this.context = this.canvas.getContext("2d"); 

        var container = document.getElementById("gameContainer");
        container.innerHTML = ""; 
        container.appendChild(this.canvas); 
    },

    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

// ===== MAIN GAME LOOP =====
function updateGameArea() {
    myGameArea.clear(); 

    if (gameState !== "playing") return; 

    let ctx = myGameArea.context;

 
    velocityX = nextVelocityX;
    velocityY = nextVelocityY;

    // Calculate new head position
    let head = {
        x: snake[0].x + velocityX,
        y: snake[0].y + velocityY
    };

    // ===== WALL COLLISION =====
    if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= myGameArea.canvas.width ||
        head.y >= myGameArea.canvas.height
    ) {
        gameOver(); 
        return;
    }

    // ===== SELF COLLISION =====
    for (let part of snake) {
        if (head.x === part.x && head.y === part.y) {
            gameOver(); 
            return;
        }
    }

    snake.unshift(head); 

    // ===== FOOD COLLISION =====
  if (head.x === food.x && head.y === food.y) {
    score++;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("snakeHighScore", highScore);
    }

    updateScoreUI();
    spawnFood();

} else {
  
    snake.pop();
}

    // ===== DRAW APPLE =====
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(food.x + grid / 2, food.y + grid / 2, grid / 2, 0, Math.PI * 2);
    ctx.fill();

    // Stem
    ctx.fillStyle = "brown";
    ctx.fillRect(food.x + grid / 2 - 2, food.y - 4, 4, 6);

    // Leaf
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.ellipse(food.x + grid / 2 + 4, food.y, 6, 3, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // ===== DRAW SNAKE =====
    for (let i = 0; i < snake.length; i++) {
        let part = snake[i];

        ctx.fillStyle = "lime";
        ctx.fillRect(part.x, part.y, grid, grid);

        // Draw eyes on head
        if (i === 0) {
            ctx.fillStyle = "white";

            // Position eyes based on movement direction
            if (velocityX > 0) {
                ctx.fillRect(part.x + 12, part.y + 5, 4, 4);
                ctx.fillRect(part.x + 12, part.y + 12, 4, 4);
            } else if (velocityX < 0) {
                ctx.fillRect(part.x + 4, part.y + 5, 4, 4);
                ctx.fillRect(part.x + 4, part.y + 12, 4, 4);
            } else if (velocityY < 0) {
                ctx.fillRect(part.x + 5, part.y + 4, 4, 4);
                ctx.fillRect(part.x + 12, part.y + 4, 4, 4);
            } else if (velocityY > 0) {
                ctx.fillRect(part.x + 5, part.y + 12, 4, 4);
                ctx.fillRect(part.x + 12, part.y + 12, 4, 4);
            }
        }
    }

}
// ===== INPUT HANDLER =====
function setDirection(x, y) {
    if (gameState === "menu") startGame(); 

    
    if (x !== 0 && velocityX === 0) {
        nextVelocityX = x;
        nextVelocityY = 0;
    }

    if (y !== 0 && velocityY === 0) {
        nextVelocityX = 0;
        nextVelocityY = y;
    }
}

// ===== KEYBOARD CONTROLS =====
document.addEventListener("keydown", function (e) {

   
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
        e.preventDefault();
    }

    if (e.key === "ArrowUp") setDirection(0, -grid);
    if (e.key === "ArrowDown") setDirection(0, grid);
    if (e.key === "ArrowLeft") setDirection(-grid, 0);
    if (e.key === "ArrowRight") setDirection(grid, 0);
});

// ===== POINTER INPUT (MOBILE / CLICK) =====
document.addEventListener("pointerdown", function () {
    if (gameState === "menu") startGame(); 
});

// ===== BUTTON CONTROLS =====
function moveUp() { setDirection(0, -grid); }
function moveDown() { setDirection(0, grid); }
function moveLeft() { setDirection(-grid, 0); }
function moveRight() { setDirection(grid, 0); }

// ===== INITIALIZE =====
myGameArea.start(); 


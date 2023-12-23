// Define directions as constants
const DIRECTIONS = {
    UP: "up",
    DOWN: "down",
    LEFT: "left",
    RIGHT: "right"
};

// Game class
class Game {
    constructor(gridSize, tileSize) {
        this.gridSize = gridSize;
        this.tileSize = tileSize;
        this.restartGame();
        this.highestScore = 0;
        this.direction = DIRECTIONS.RIGHT; 
    }

    restartGame() {
        const midPoint = Math.floor(this.gridSize / 2);
        this.snake = [{x: midPoint, y: midPoint}, {x: midPoint, y: midPoint + 1}, {x: midPoint, y: midPoint + 2}];
        this.direction = DIRECTIONS.RIGHT;
        this.food = this.getRandomFoodPosition();
        this.score = 0;
        this.updateScoreBoard();
    }

    handleGameOver() {
        alert("Game Over! Your snake collided with its own tail. Better luck next time!");
        gameApp.stop();
        this.restartGame();
      }
    

    moveSnake() {
        const head = Object.assign({}, this.snake[0]);

        // Check for collision with the snake's tail
        if (this.isCollidingWithSnakeTail(head)) {
            this.handleGameOver();
            return;
        }

        // Update head position based on direction
        switch (this.direction) {
            case DIRECTIONS.UP: 
                head.y -= 1;
                break;
            case DIRECTIONS.DOWN: 
                head.y += 1;
                break;
            case DIRECTIONS.LEFT: 
                head.x -= 1;
                break;
            case DIRECTIONS.RIGHT: 
                head.x += 1;
                break;
        }

        // Check for collision with defined boundary
        if (this.isCollidingWithBoundary(head)) {
            const playAgain = confirm("You fell into the ocean! Unfortunately, you're -not- a water snake... Do you want to start over?");
            playAgain ? this.restartGame() : this.handleGameOver();
            return;
        }

        // Check for collision with food
        if (this.isCollidingWithFood()) {
            this.food = this.getRandomFoodPosition();
            this.snake.push({});
        } else {
            this.snake.pop();
        }

        this.snake.unshift(head);
    }

    isCollidingWithBoundary(t) {
        return t.x < 0 || t.x >= this.gridSize || t.y < 0 || t.y >= this.gridSize;
      }
      
    isCollidingWithFood() {
        if (this.snake[0].x === this.food.x && this.snake[0].y === this.food.y) {
            this.score += 10;
            this.highestScore = Math.max(this.highestScore, this.score);
            this.updateScoreBoard();
            return true;
        }
        return false;
    }

    updateScoreBoard() {
        const scoreBoard = document.getElementById('scoreBoard');
        scoreBoard.textContent = `Score: ${this.score} | Highest Score: ${this.highestScore}`;
    }

    isCollidingWithSnakeTail(head) {
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return true;
            }
        }
        return false;
    }

    getRandomFoodPosition() {
        return {
            x: Math.floor(Math.random() * this.gridSize),
            y: Math.floor(Math.random() * this.gridSize)
        };
    }
}

// Renderer class
class Renderer {
    constructor(canvasContext, tileSize, game) {
        this.ctx = canvasContext;
        this.tileSize = tileSize;
        this.game = game;
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    drawSnake() {
        this.game.snake.forEach((segment, index) => {
            const color = index === 0 ? "#546e7a" : (index === this.game.snake.length - 1 ? "#90a4ae" : "#78909c");
            this.ctx.fillStyle = color;
            this.ctx.fillRect(segment.x * this.tileSize, segment.y * this.tileSize, this.tileSize, this.tileSize);
            this.ctx.strokeStyle = "black";
            this.ctx.strokeRect(segment.x * this.tileSize, segment.y * this.tileSize, this.tileSize, this.tileSize);
        });
    }

    drawFood() {
        this.ctx.fillStyle = "#e57373";
        this.ctx.fillRect(this.game.food.x * this.tileSize, this.game.food.y * this.tileSize, this.tileSize, this.tileSize);
    }

    drawScores() {
        this.ctx.fillStyle = "#333";this.ctx.font = "16px Arial";
        this.ctx.fillText(`Score: ${this.game.score}`, 10, 20);
        this.ctx.fillText(`Highest Score: ${this.game.highestScore}`, 10, 40);
    }
}

// UserInput class
class UserInput {
    constructor(game) {
        this.game = game;
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener("keydown", (e) => {
            const directions = {
                ArrowUp: DIRECTIONS.UP,
                ArrowDown: DIRECTIONS.DOWN,
                ArrowLeft: DIRECTIONS.LEFT,
                ArrowRight: DIRECTIONS.RIGHT
            };

            // Prevent the snake from moving in the opposite direction immediately
            if (directions[e.key]) {
                const newDirection = directions[e.key];
                const { direction } = this.game;
                if (
                    (direction === DIRECTIONS.UP && newDirection !== DIRECTIONS.DOWN) ||
                    (direction === DIRECTIONS.DOWN && newDirection !== DIRECTIONS.UP) ||
                    (direction === DIRECTIONS.LEFT && newDirection !== DIRECTIONS.RIGHT) ||
                    (direction === DIRECTIONS.RIGHT && newDirection !== DIRECTIONS.LEFT)
                ) {
                    this.game.direction = newDirection;
                }
            }
        });
    }
}
class GameApp{
    constructor(canvas){
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.gridSize = 20;
        this.tileSize = 20;
        this.canvas.width = this.gridSize * this.tileSize;
        this.canvas.height = this.gridSize * this.tileSize;
        this.game = new Game(this.gridSize, this.tileSize);
        this.renderer = new Renderer(this.ctx, this.tileSize, this.game);
        this.userInput = new UserInput(this.game);
        this.gameSpeed = 100;  // You can adjust this value to control the speed of the game
    }
    start(){
        this.gameInterval = setInterval(() => this.gameLoop(), this.gameSpeed);
    }
    gameLoop(){
        this.renderer.clearCanvas();
        this.game.moveSnake();
        this.renderer.drawSnake();
        this.renderer.drawFood();
        this.renderer.drawScores();
    }
    stop() {
        clearInterval(this.gameInterval);
    }
}

const canvas = document.getElementById("gameCanvas");
const gameApp = new GameApp(canvas);
gameApp.start();
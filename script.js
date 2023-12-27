// Define directions as constants
const DIRECTIONS = {
    UP: "up",
    DOWN: "down",
    LEFT: "left",
    RIGHT: "right"
};

// Color key for food items & corresponding points
const FOOD_COLORS = {
    BLUE: "#2196F3",      // Blue: 5 points
    GREEN: "#4CAF50",     // Green: 20 points
    LIGHT_RED: "#FFCDD2"  // Light Red: 50 points
};

// Define food chances
const FOOD_CHANCES = {
    TREASURE_CHEST: 0.02,
    GREEN: 0.3,
    LIGHT_RED: 0.6
};

// Preload treasure chest img
const treasureChestImage = new Image();
treasureChestImage.src = 'trsure-chst.png';

// Game class
class Game {
    constructor(gridSize, tileSize) {
        this.gridSize = gridSize;
        this.tileSize = tileSize;
        this.restartGame();
        this.highestScore = 0;
        this.direction = DIRECTIONS.RIGHT;
        this.highestScore = parseInt(localStorage.getItem('highestScore')) || 0;
    }

    restartGame() {
        const midPoint = Math.floor(this.gridSize / 2);
        this.snake = [{ x: midPoint, y: midPoint }, { x: midPoint, y: midPoint + 1 }, { x: midPoint, y: midPoint + 2 }];
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

        // Check for collision with the snake tail
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

        // Check for collision with defined boundary (falling off boat!)
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
            // Update score based points via food
            switch (this.food.type) {
                case "BLUE":
                    this.score += 5;
                    break;
                case "GREEN":
                    this.score += 20;
                    break;
                case "LIGHT_RED":
                    this.score += 50;
                    break;
                case "TREASURE_CHEST":
                    this.score += 100;
                    break;
            }

            this.updateScoreBoard();
            return true;
        }
        return false;
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
        const randomX = Math.floor(Math.random() * this.gridSize);
        const randomY = Math.floor(Math.random() * this.gridSize);

        let foodType;
        if (Math.random() < FOOD_CHANCES.TREASURE_CHEST) {
            foodType = "TREASURE_CHEST";
        } else if (Math.random() < FOOD_CHANCES.GREEN) {
            foodType = "GREEN";
        } else if (Math.random() < FOOD_CHANCES.LIGHT_RED) {
            foodType = "LIGHT_RED";
        } else {
            foodType = "BLUE";
        }
        return {
            x: randomX,
            y: randomY,
            type: foodType
        };
    }

    updateScoreBoard() {
        const scoreBoard = document.getElementById('scoreBoard');
        scoreBoard.textContent = `Score: ${this.score} | Highest Score: ${this.highestScore}`;
     
        // If current score is higher than user's highest score, update highest score via localStorage
        if (this.score > this.highestScore) {
            this.highestScore = this.score;
            localStorage.setItem('highestScore', this.highestScore);
        }
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

            // Simulate wooden deck for ship
            if (index % 2 === 0) {
                this.ctx.fillStyle = "#a1887f"; // Fixed styling error
            }
            this.ctx.fillRect(segment.x * this.tileSize, segment.y * this.tileSize, this.tileSize, this.tileSize);
        });
    }

    drawFood() {
        switch (this.game.food.type) {
            case "BLUE":
                this.ctx.fillStyle = FOOD_COLORS.BLUE;
                break;
            case "GREEN":
                this.ctx.fillStyle = FOOD_COLORS.GREEN;
                break;
            case "LIGHT_RED":
                this.ctx.fillStyle = FOOD_COLORS.LIGHT_RED;
                break;
            case "TREASURE_CHEST":
                this.ctx.drawImage(treasureChestImage, this.game.food.x * this.tileSize, this.game.food.y * this.tileSize, this.tileSize, this.tileSize);
                return;
        }
        this.ctx.fillRect(this.game.food.x * this.tileSize, this.game.food.y * this.tileSize, this.tileSize, this.tileSize);
    }

    drawScores() {
        this.ctx.fillStyle = "#333";
        this.ctx.font = "16px Arial";
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

            // Prevent snake from moving in the opposite direction as default
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

class GameApp {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.gridSize = 20;
        this.tileSize = 20;
        this.canvas.width = this.gridSize * this.tileSize;
        this.canvas.height = this.gridSize * this.tileSize;
        this.game = new Game(this.gridSize, this.tileSize);
        this.renderer = new Renderer(this.ctx, this.tileSize, this.game);
        this.userInput = new UserInput(this.game);
        this.gameSpeed = 100;
    }

    start() {
        this.gameInterval = setInterval(() => this.gameLoop(), this.gameSpeed);
    }

    gameLoop() {
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

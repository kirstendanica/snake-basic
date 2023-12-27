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

// Other constants
const DEFAULT_GAME_SPEED = 100;
const CANVAS_BACKGROUND_COLOR = "#ffffff";

// Preload treasure chest img
const treasureChestImage = new Image();
treasureChestImage.src = 'trsure-chst.png';

// Preload sound effects
const eatSound = new Audio('snake-eats.mp3');
const gameOverSound = new Audio('gmover-sound.wav');
// Background music
const backgroundMusic = new Audio('happy-pirate-accordion.wav');
backgroundMusic.loop = true;

// Game class
class Game {
    constructor(gridSize, tileSize) {
        this.gridSize = gridSize;
        this.tileSize = tileSize;
        this.restartGame();
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
        gameOverSound.play();
        alert("Game Over! Your snake collided with its own tail. Better luck next time!");
        gameApp.stop();
        this.restartGame();
    }

    moveSnake() {
        const head = { ...this.snake[0] };

        // Check for collision with the snake tail
        if (this.isCollidingWithSnakeTail(head)) {
            this.handleGameOver();
            return;
        }

        // Update head position based on direction
        this.updateHeadPosition(head);

        // Check for collision with defined boundary (falling off boat!)
        if (this.isCollidingWithBoundary(head)) {
            this.handleBoundaryCollision();
            return;
        }

        // Check for collision with food
        this.handleFoodCollision(head);
    }

    updateHeadPosition(head) {
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
    }

    handleBoundaryCollision() {
        gameOverSound.play();
        const playAgain = confirm("You fell into the ocean! Unfortunately, you're -not- a water snake... Do you want to start over?");
        playAgain ? this.restartGame() : this.handleGameOver();
    }

    handleFoodCollision(head) {
        if (this.isCollidingWithFood()) {
            eatSound.play();
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
            this.updateScoreByFoodType();
            this.updateScoreBoard();
            return true;
        }
        return false;
    }

    updateScoreByFoodType() {
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
            this.drawSnakeSegment(segment, index);
            this.drawWoodenDeck(segment, index);
        });
    }

    drawSnakeSegment(segment, index) {
        const color = this.getSnakeSegmentColor(index);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(segment.x * this.tileSize, segment.y * this.tileSize, this.tileSize, this.tileSize);
        this.ctx.strokeStyle = "black";
        this.ctx.strokeRect(segment.x * this.tileSize, segment.y * this.tileSize, this.tileSize, this.tileSize);
    }

    getSnakeSegmentColor(index) {
        return index === 0 ? "#546e7a" : (index === this.game.snake.length - 1 ? "#90a4ae" : "#78909c");
    }

    drawWoodenDeck(segment, index) {
        if (index % 2 === 0) {
            this.ctx.fillStyle = "#a1887f";
            this.ctx.fillRect(segment.x * this.tileSize, segment.y * this.tileSize, this.tileSize, this.tileSize);
        }
    }

    drawFood() {
        const { type, x, y } = this.game.food;

        switch (type) {
            case "TREASURE_CHEST":
                this.ctx.drawImage(treasureChestImage, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                break;
            default:
                this.ctx.fillStyle = FOOD_COLORS[type];
                this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
        }
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
            this.handleKeyPress(e);
        });
    }

    handleKeyPress(event) {
        const directions = {
            ArrowUp: DIRECTIONS.UP,
            ArrowDown: DIRECTIONS.DOWN,
            ArrowLeft: DIRECTIONS.LEFT,
            ArrowRight: DIRECTIONS.RIGHT
        };

        const newDirection = directions[event.key];
        if (newDirection && this.isValidDirection(newDirection)) {
            this.game.direction = newDirection;
        }
    }

    isValidDirection(newDirection) {
        const { direction } = this.game;
        return (
            (direction === DIRECTIONS.UP && newDirection !== DIRECTIONS.DOWN) ||
            (direction === DIRECTIONS.DOWN && newDirection !== DIRECTIONS.UP) ||
            (direction === DIRECTIONS.LEFT && newDirection !== DIRECTIONS.RIGHT) ||
            (direction === DIRECTIONS.RIGHT && newDirection !== DIRECTIONS.LEFT)
        );
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
        this.gameSpeed = DEFAULT_GAME_SPEED;

        // Define and bind first interaction handler
        this.handleFirstInteraction = () => {
            // Play background music
            backgroundMusic.play();
            // Remove the event listeners to prevent multiple triggers
            document.removeEventListener('click', this.handleFirstInteraction);
            document.removeEventListener('keydown', this.handleFirstInteraction);
        };

        // Event listeners to trigger background music via 'click' and 'keydown'
        document.addEventListener('click', this.handleFirstInteraction);
        document.addEventListener('keydown', this.handleFirstInteraction);
    }

    start() {
        backgroundMusic.play();
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

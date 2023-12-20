// Game class
class Game {
    constructor(gridSize, tileSize) {
      this.gridSize = gridSize;
      this.tileSize = tileSize;
      this.snake = [{ x: gridSize / 2, y: gridSize / 2 }, { x: gridSize / 2, y: gridSize / 2 + 1 }, { x: gridSize / 2, y: gridSize / 2 + 2 }];
      this.direction = "up";
      this.food = this.getRandomFoodPosition();
    }
  
    handleGameOver() {
      alert("Game Over! Your snake collided with its own tail. Better luck next time!");
      this.restartGame();
    }
  
    moveSnake() {
      const head = { x: this.snake[0].x, y: this.snake[0].y };
  
      // Check for collision with the snake's tail
      if (this.isCollidingWithSnakeTail(head)) {
        this.handleGameOver();
        return;
      }
  
      // Update head position based on direction
      if (this.direction === "up") head.y -= 1;
      if (this.direction === "down") head.y += 1;
      if (this.direction === "left") head.x -= 1;
      if (this.direction === "right") head.x += 1;
  
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
  
    restartGame() {
      this.snake = [{ x: this.gridSize / 2, y: this.gridSize / 2 }, { x: this.gridSize / 2, y: this.gridSize / 2 + 1 }, { x: this.gridSize / 2, y: this.gridSize / 2 + 2 }];
      this.direction = "up";
      this.food = this.getRandomFoodPosition();
    }
  
    isCollidingWithBoundary(position) {
      return position.x < 0 || position.x >= this.gridSize || position.y < 0 || position.y >= this.gridSize;
    }
  
    isCollidingWithFood() {
      return this.snake[0].x === this.food.x && this.snake[0].y === this.food.y;
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
      return { x: Math.floor(Math.random() * this.gridSize), y: Math.floor(Math.random() * this.gridSize) };
    }
  }
  
  // Renderer class
  class Renderer {
    constructor(canvasContext, tileSize) {
      this.ctx = canvasContext;
      this.tileSize = tileSize;
    }
  
    clearCanvas() {
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
  
    drawSnake(snake) {
      snake.forEach((segment, index) => {
        const color = index === 0 ? "#546e7a" : (index === snake.length - 1 ? "#90a4ae" : "#78909c");
        this.ctx.fillStyle = color;
        this.ctx.fillRect(segment.x * this.tileSize, segment.y * this.tileSize, this.tileSize, this.tileSize);
        this.ctx.strokeStyle = "black";
        this.ctx.strokeRect(segment.x * this.tileSize, segment.y * this.tileSize, this.tileSize, this.tileSize);
      });
    }
  
    drawFood(food) {
      this.ctx.fillStyle = "#e57373";
      this.ctx.fillRect(food.x * this.tileSize, food.y * this.tileSize, this.tileSize, this.tileSize);
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
        const directions = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
        if (directions[e.key] && this.game.direction !== directions[e.key]) this.game.direction = directions[e.key];
      });
    }
  }
  
  // GameApp class
  class GameApp {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = this.canvas.getContext("2d");
      this.gridSize = 20;
      this.tileSize = 20;
      this.canvas.width = this.gridSize * this.tileSize;
      this.canvas.height = this.gridSize * this.tileSize;
      this.game = new Game(this.gridSize, this.tileSize);
      this.renderer = new Renderer(this.ctx, this.tileSize);
      this.userInput = new UserInput(this.game);
    }
  
    start() {
      this.gameLoop();
    }
  
    gameLoop() {
      this.renderer.clearCanvas();
      this.game.moveSnake();
      this.renderer.drawSnake(this.game.snake);
      this.renderer.drawFood(this.game.food);
      setTimeout(() => this.gameLoop(), 100);
    }
  }
  
  // Initialize game on the "gameCanvas" element
  const canvas = document.getElementById("gameCanvas");
  const gameApp = new GameApp(canvas);
  gameApp.start();
  
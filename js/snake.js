class SnakeGame {
  constructor(container, options = {}) {
    this.container = container;
    this.onScore = options.onScore || (() => {});
    this.onGameOver = options.onGameOver || (() => {});
    this.difficulty = options.difficulty || 'medium';

    this.gridSize = 20;
    this.tileCount = 20; // 20x20 grid
    this.canvasSize = this.gridSize * this.tileCount;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvasSize;
    this.canvas.height = this.canvasSize;
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    this.snake = [];
    this.food = { x: 0, y: 0 };
    this.dx = 0;
    this.dy = 0;
    this.score = 0;
    this.gameLoop = null;
    this.running = false;
    this.paused = false;
    this.speed = this.getSpeed();

    this.keyHandler = this.handleKey.bind(this);
  }

  getSpeed() {
    const speeds = { easy: 140, medium: 100, hard: 65 };
    return speeds[this.difficulty] || 100;
  }

  setDifficulty(diff) {
    this.difficulty = diff;
    this.speed = this.getSpeed();
  }

  start() {
    this.reset();
    this.running = true;
    this.paused = false;
    document.addEventListener('keydown', this.keyHandler);
    this.loop();
  }

  reset() {
    this.snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    this.dx = 1;
    this.dy = 0;
    this.score = 0;
    this.onScore(0);
    this.placeFood();
    this.draw();
  }

  placeFood() {
    let valid = false;
    while (!valid) {
      this.food = {
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount),
      };
      valid = !this.snake.some(
        (s) => s.x === this.food.x && s.y === this.food.y
      );
    }
  }

  handleKey(e) {
    if (!this.running || this.paused) return;
    const key = e.key;
    // Prevent reverse
    if ((key === 'ArrowUp' || key === 'w' || key === 'W') && this.dy !== 1) {
      this.dx = 0;
      this.dy = -1;
      e.preventDefault();
    } else if ((key === 'ArrowDown' || key === 's' || key === 'S') && this.dy !== -1) {
      this.dx = 0;
      this.dy = 1;
      e.preventDefault();
    } else if ((key === 'ArrowLeft' || key === 'a' || key === 'A') && this.dx !== 1) {
      this.dx = -1;
      this.dy = 0;
      e.preventDefault();
    } else if ((key === 'ArrowRight' || key === 'd' || key === 'D') && this.dx !== -1) {
      this.dx = 1;
      this.dy = 0;
      e.preventDefault();
    }
  }

  loop() {
    if (!this.running) return;
    this.gameLoop = setTimeout(() => {
      if (!this.paused) {
        this.update();
        this.draw();
      }
      this.loop();
    }, this.speed);
  }

  update() {
    const head = {
      x: this.snake[0].x + this.dx,
      y: this.snake[0].y + this.dy,
    };

    // Wall collision
    if (
      head.x < 0 ||
      head.x >= this.tileCount ||
      head.y < 0 ||
      head.y >= this.tileCount
    ) {
      this.endGame();
      return;
    }

    // Self collision
    if (this.snake.some((s) => s.x === head.x && s.y === head.y)) {
      this.endGame();
      return;
    }

    this.snake.unshift(head);

    // Food
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.onScore(this.score);
      this.placeFood();
      // Optional: slight speed up on hard
      if (this.difficulty === 'hard' && this.score % 50 === 0) {
        this.speed = Math.max(40, this.speed - 5);
      }
    } else {
      this.snake.pop();
    }
  }

  draw() {
    const ctx = this.ctx;
    const g = this.gridSize;

    // Background
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);

    // Grid (subtle)
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= this.tileCount; i++) {
      ctx.beginPath();
      ctx.moveTo(i * g, 0);
      ctx.lineTo(i * g, this.canvasSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * g);
      ctx.lineTo(this.canvasSize, i * g);
      ctx.stroke();
    }

    // Food
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(
      this.food.x * g + g / 2,
      this.food.y * g + g / 2,
      g / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Snake
    this.snake.forEach((seg, i) => {
      const alpha = 1 - (i / this.snake.length) * 0.5;
      ctx.fillStyle = i === 0 ? '#00d4ff' : `rgba(0, 212, 255, ${alpha})`;
      ctx.fillRect(seg.x * g + 1, seg.y * g + 1, g - 2, g - 2);
      if (i === 0) {
        // Eyes
        ctx.fillStyle = '#0f0f1a';
        const eyeOffset = 4;
        if (this.dx === 1) {
          ctx.fillRect(seg.x * g + g - 8, seg.y * g + 4, 3, 3);
          ctx.fillRect(seg.x * g + g - 8, seg.y * g + g - 7, 3, 3);
        } else if (this.dx === -1) {
          ctx.fillRect(seg.x * g + 5, seg.y * g + 4, 3, 3);
          ctx.fillRect(seg.x * g + 5, seg.y * g + g - 7, 3, 3);
        } else if (this.dy === -1) {
          ctx.fillRect(seg.x * g + 4, seg.y * g + 5, 3, 3);
          ctx.fillRect(seg.x * g + g - 7, seg.y * g + 5, 3, 3);
        } else {
          ctx.fillRect(seg.x * g + 4, seg.y * g + g - 8, 3, 3);
          ctx.fillRect(seg.x * g + g - 7, seg.y * g + g - 8, 3, 3);
        }
      }
    });
  }

  endGame() {
    this.running = false;
    clearTimeout(this.gameLoop);
    document.removeEventListener('keydown', this.keyHandler);
    this.onGameOver({ score: this.score, message: 'Crashed!' });
  }

  togglePause() {
    this.paused = !this.paused;
    return this.paused;
  }

  destroy() {
    this.running = false;
    clearTimeout(this.gameLoop);
    document.removeEventListener('keydown', this.keyHandler);
    this.container.innerHTML = '';
  }
}
window.SnakeGame = SnakeGame;

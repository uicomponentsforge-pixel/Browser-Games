class BreakoutGame {
  constructor(container, options = {}) {
    this.container = container;
    this.onScore = options.onScore || (() => {});
    this.onGameOver = options.onGameOver || (() => {});
    this.onWin = options.onWin || (() => {});
    this.difficulty = options.difficulty || 'medium';

    this.width = 480;
    this.height = 360;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    this.paddle = { w: 80, h: 12, x: 0, y: 0 };
    this.ball = { x: 0, y: 0, r: 7, dx: 0, dy: 0, speed: 4 };
    this.bricks = [];
    this.rows = 5;
    this.cols = 8;
    this.brickW = 0;
    this.brickH = 18;
    this.brickPadding = 6;
    this.brickOffsetTop = 40;
    this.brickOffsetLeft = 20;

    this.score = 0;
    this.lives = 3;
    this.running = false;
    this.paused = false;
    this.animId = null;
    this.keys = { left: false, right: false };

    this.keyDown = this.onKeyDown.bind(this);
    this.keyUp = this.onKeyUp.bind(this);
    this.mouseMove = this.onMouseMove.bind(this);
  }

  getConfig() {
    const configs = {
      easy: { ballSpeed: 3.2, paddleW: 100, lives: 5 },
      medium: { ballSpeed: 4.2, paddleW: 80, lives: 3 },
      hard: { ballSpeed: 5.5, paddleW: 60, lives: 2 },
    };
    return configs[this.difficulty] || configs.medium;
  }

  setDifficulty(diff) {
    this.difficulty = diff;
  }

  start() {
    this.reset();
    this.running = true;
    this.paused = false;
    document.addEventListener('keydown', this.keyDown);
    document.addEventListener('keyup', this.keyUp);
    this.canvas.addEventListener('mousemove', this.mouseMove);
    this.loop();
  }

  reset() {
    const cfg = this.getConfig();
    this.paddle.w = cfg.paddleW;
    this.paddle.h = 12;
    this.paddle.x = (this.width - this.paddle.w) / 2;
    this.paddle.y = this.height - 30;

    this.ball.speed = cfg.ballSpeed;
    this.ball.r = 7;
    this.ball.x = this.width / 2;
    this.ball.y = this.paddle.y - this.ball.r - 2;
    this.ball.dx = cfg.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
    this.ball.dy = -cfg.ballSpeed;

    this.lives = cfg.lives;
    this.score = 0;
    this.onScore(0);

    this.brickW =
      (this.width - this.brickOffsetLeft * 2 - this.brickPadding * (this.cols - 1)) /
      this.cols;

    this.bricks = [];
    const colors = ['#ff6b6b', '#fcc419', '#51cf66', '#00d4ff', '#a78bfa'];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.bricks.push({
          x: this.brickOffsetLeft + c * (this.brickW + this.brickPadding),
          y: this.brickOffsetTop + r * (this.brickH + this.brickPadding),
          w: this.brickW,
          h: this.brickH,
          alive: true,
          color: colors[r % colors.length],
          points: (this.rows - r) * 10,
        });
      }
    }
  }

  onKeyDown(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = true;
  }

  onKeyUp(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const mx = (e.clientX - rect.left) * scaleX;
    this.paddle.x = Math.max(0, Math.min(this.width - this.paddle.w, mx - this.paddle.w / 2));
  }

  loop() {
    if (!this.running) return;
    this.animId = requestAnimationFrame(() => this.loop());
    if (this.paused) return;
    this.update();
    this.draw();
  }

  update() {
    // Paddle movement (keyboard)
    const paddleSpeed = 7;
    if (this.keys.left) this.paddle.x = Math.max(0, this.paddle.x - paddleSpeed);
    if (this.keys.right)
      this.paddle.x = Math.min(this.width - this.paddle.w, this.paddle.x + paddleSpeed);

    // Ball
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;

    // Walls
    if (this.ball.x - this.ball.r < 0 || this.ball.x + this.ball.r > this.width) {
      this.ball.dx = -this.ball.dx;
      this.ball.x = Math.max(this.ball.r, Math.min(this.width - this.ball.r, this.ball.x));
    }
    if (this.ball.y - this.ball.r < 0) {
      this.ball.dy = -this.ball.dy;
    }

    // Paddle collision
    if (
      this.ball.y + this.ball.r >= this.paddle.y &&
      this.ball.y - this.ball.r <= this.paddle.y + this.paddle.h &&
      this.ball.x >= this.paddle.x &&
      this.ball.x <= this.paddle.x + this.paddle.w &&
      this.ball.dy > 0
    ) {
      // Angle based on hit position
      const hitPos = (this.ball.x - this.paddle.x) / this.paddle.w; // 0..1
      const angle = (hitPos - 0.5) * Math.PI * 0.7; // -0.35pi .. 0.35pi
      const speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
      this.ball.dx = Math.sin(angle) * speed;
      this.ball.dy = -Math.cos(angle) * speed;
      // Slight speed increase
      this.ball.dx *= 1.02;
      this.ball.dy *= 1.02;
    }

    // Bottom
    if (this.ball.y - this.ball.r > this.height) {
      this.lives--;
      if (this.lives <= 0) {
        this.endGame(false);
        return;
      }
      // Reset ball
      this.ball.x = this.width / 2;
      this.ball.y = this.paddle.y - this.ball.r - 2;
      const cfg = this.getConfig();
      this.ball.dx = cfg.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
      this.ball.dy = -cfg.ballSpeed;
    }

    // Bricks
    for (const brick of this.bricks) {
      if (!brick.alive) continue;
      if (
        this.ball.x + this.ball.r > brick.x &&
        this.ball.x - this.ball.r < brick.x + brick.w &&
        this.ball.y + this.ball.r > brick.y &&
        this.ball.y - this.ball.r < brick.y + brick.h
      ) {
        brick.alive = false;
        this.score += brick.points;
        this.onScore(this.score);

        // Determine bounce direction
        const overlapLeft = this.ball.x + this.ball.r - brick.x;
        const overlapRight = brick.x + brick.w - (this.ball.x - this.ball.r);
        const overlapTop = this.ball.y + this.ball.r - brick.y;
        const overlapBottom = brick.y + brick.h - (this.ball.y - this.ball.r);
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        if (minOverlap === overlapLeft || minOverlap === overlapRight) {
          this.ball.dx = -this.ball.dx;
        } else {
          this.ball.dy = -this.ball.dy;
        }
        break;
      }
    }

    // Win check
    if (this.bricks.every((b) => !b.alive)) {
      this.endGame(true);
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, this.width, this.height);

    // Bricks
    for (const b of this.bricks) {
      if (!b.alive) continue;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 4);
      ctx.fill();
    }

    // Paddle
    ctx.fillStyle = '#00d4ff';
    ctx.beginPath();
    ctx.roundRect(this.paddle.x, this.paddle.y, this.paddle.w, this.paddle.h, 6);
    ctx.fill();

    // Ball
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2);
    ctx.fill();

    // Lives
    ctx.fillStyle = '#a0a0b8';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Lives: ${this.lives}`, 10, 22);
  }

  endGame(won) {
    this.running = false;
    cancelAnimationFrame(this.animId);
    document.removeEventListener('keydown', this.keyDown);
    document.removeEventListener('keyup', this.keyUp);
    this.canvas.removeEventListener('mousemove', this.mouseMove);
    if (won) {
      this.onWin({ score: this.score, message: 'All bricks cleared!' });
    } else {
      this.onGameOver({ score: this.score, message: 'No lives left' });
    }
  }

  togglePause() {
    this.paused = !this.paused;
    return this.paused;
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.animId);
    document.removeEventListener('keydown', this.keyDown);
    document.removeEventListener('keyup', this.keyUp);
    this.canvas.removeEventListener('mousemove', this.mouseMove);
    this.container.innerHTML = '';
  }
}
window.BreakoutGame = BreakoutGame;

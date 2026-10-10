class TicTacToeGame {
  constructor(container, options = {}) {
    this.container = container;
    this.onScore = options.onScore || (() => {});
    this.onWin = options.onWin || (() => {});
    this.onGameOver = options.onGameOver || (() => {});
    this.difficulty = options.difficulty || 'medium';

    this.board = Array(9).fill(null);
    this.current = 'X'; // Player is X
    this.gameOver = false;
    this.score = 0; // Wins for player in session, but we track per game for HS as wins
    this.wins = 0;
    this.losses = 0;
    this.draws = 0;
  }

  setDifficulty(diff) {
    this.difficulty = diff;
  }

  start() {
    this.reset();
  }

  reset() {
    this.board = Array(9).fill(null);
    this.current = 'X';
    this.gameOver = false;
    this.score = this.wins; // Keep session wins as score
    this.onScore(this.score);
    this.render();
  }

  render() {
    this.container.innerHTML = '';

    const status = document.createElement('div');
    status.className = 'ttt-status';
    status.id = 'ttt-status';
    status.textContent = this.gameOver
      ? ''
      : this.current === 'X'
      ? 'Your turn (X)'
      : 'AI thinking...';
    this.container.appendChild(status);

    const boardEl = document.createElement('div');
    boardEl.className = 'ttt-board';

    this.board.forEach((cell, i) => {
      const el = document.createElement('div');
      el.className = 'ttt-cell' + (cell ? ' taken ' + cell.toLowerCase() : '');
      el.textContent = cell || '';
      el.dataset.index = i;
      if (!cell && !this.gameOver) {
        el.addEventListener('click', () => this.playerMove(i));
      }
      boardEl.appendChild(el);
    });

    this.container.appendChild(boardEl);

    const record = document.createElement('div');
    record.className = 'game-message';
    record.textContent = `Wins: ${this.wins} | Losses: ${this.losses} | Draws: ${this.draws}`;
    this.container.appendChild(record);
  }

  playerMove(index) {
    if (this.gameOver || this.board[index] || this.current !== 'X') return;
    this.board[index] = 'X';
    this.current = 'O';
    this.render();

    const result = this.checkWinner();
    if (result) {
      this.handleResult(result);
      return;
    }

    // AI move
    setTimeout(() => this.aiMove(), 350);
  }

  aiMove() {
    if (this.gameOver) return;
    let move;
    if (this.difficulty === 'easy') {
      move = this.randomMove();
    } else if (this.difficulty === 'medium') {
      // 60% optimal, 40% random
      move = Math.random() < 0.6 ? this.bestMove() : this.randomMove();
    } else {
      move = this.bestMove();
    }

    if (move != null) {
      this.board[move] = 'O';
      this.current = 'X';
      this.render();
      const result = this.checkWinner();
      if (result) this.handleResult(result);
    }
  }

  randomMove() {
    const empties = this.board
      .map((v, i) => (v === null ? i : null))
      .filter((v) => v !== null);
    if (empties.length === 0) return null;
    return empties[Math.floor(Math.random() * empties.length)];
  }

  bestMove() {
    // Minimax
    let bestScore = -Infinity;
    let move = null;
    for (let i = 0; i < 9; i++) {
      if (this.board[i] === null) {
        this.board[i] = 'O';
        const score = this.minimax(this.board, 0, false);
        this.board[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  }

  minimax(board, depth, isMaximizing) {
    const result = this.evaluate(board);
    if (result !== null) return result;

    if (isMaximizing) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          best = Math.max(best, this.minimax(board, depth + 1, false));
          board[i] = null;
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          best = Math.min(best, this.minimax(board, depth + 1, true));
          board[i] = null;
        }
      }
      return best;
    }
  }

  evaluate(board) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] === 'O' ? 10 : -10;
      }
    }
    if (board.every((c) => c !== null)) return 0;
    return null;
  }

  checkWinner() {
    const result = this.evaluate(this.board);
    if (result === 10) return 'O';
    if (result === -10) return 'X';
    if (this.board.every((c) => c !== null)) return 'draw';
    return null;
  }

  handleResult(result) {
    this.gameOver = true;
    if (result === 'X') {
      this.wins++;
      this.score = this.wins;
      this.onScore(this.score);
      this.onWin({ score: this.score, message: 'You beat the AI!' });
    } else if (result === 'O') {
      this.losses++;
      this.onGameOver({ score: this.score, message: 'AI wins this round' });
    } else {
      this.draws++;
      this.onGameOver({ score: this.score, message: "It's a draw" });
    }
    // Update status text
    const status = document.getElementById('ttt-status');
    if (status) {
      status.textContent =
        result === 'X' ? 'You Win!' : result === 'O' ? 'AI Wins' : 'Draw';
    }
  }

  destroy() {
    this.container.innerHTML = '';
  }
}
window.TicTacToeGame = TicTacToeGame;

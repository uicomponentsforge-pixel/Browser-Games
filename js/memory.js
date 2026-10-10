class MemoryGame {
  constructor(container, options = {}) {
    this.container = container;
    this.onScore = options.onScore || (() => {});
    this.onWin = options.onWin || (() => {});
    this.difficulty = options.difficulty || 'medium';

    this.board = null;
    this.cards = [];
    this.flipped = [];
    this.matched = 0;
    this.moves = 0;
    this.score = 0;
    this.locked = false;
    this.startTime = null;
    this.timerId = null;

    this.symbols = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍒', '🥝', '🍍', '🥭', '🍑', '🥥'];
  }

  getPairCount() {
    const map = { easy: 6, medium: 8, hard: 12 };
    return map[this.difficulty] || 8;
  }

  setDifficulty(diff) {
    this.difficulty = diff;
  }

  start() {
    this.reset();
  }

  reset() {
    this.matched = 0;
    this.moves = 0;
    this.score = 0;
    this.flipped = [];
    this.locked = false;
    this.onScore(0);
    if (this.timerId) clearInterval(this.timerId);

    const pairs = this.getPairCount();
    const chosen = this.symbols.slice(0, pairs);
    const deck = [...chosen, ...chosen];
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    this.cards = deck.map((sym, i) => ({
      id: i,
      symbol: sym,
      flipped: false,
      matched: false,
    }));

    this.renderBoard(pairs);
    this.startTime = Date.now();
  }

  renderBoard(pairs) {
    this.container.innerHTML = '';
    this.board = document.createElement('div');
    this.board.className = 'memory-board';

    // Columns based on pairs
    let cols = 4;
    if (pairs === 6) cols = 4;
    if (pairs === 8) cols = 4;
    if (pairs === 12) cols = 6;
    this.board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    this.cards.forEach((card) => {
      const el = document.createElement('div');
      el.className = 'memory-card';
      el.dataset.id = card.id;
      el.innerHTML = `<span class="card-back">?</span><span class="card-front" style="display:none">${card.symbol}</span>`;
      el.addEventListener('click', () => this.flipCard(card.id));
      this.board.appendChild(el);
    });

    this.container.appendChild(this.board);

    // Status
    const status = document.createElement('div');
    status.className = 'game-message';
    status.id = 'memory-status';
    status.textContent = `Moves: 0 | Matched: 0 / ${pairs}`;
    this.container.appendChild(status);
  }

  flipCard(id) {
    if (this.locked) return;
    const card = this.cards[id];
    if (card.flipped || card.matched) return;
    if (this.flipped.length >= 2) return;

    card.flipped = true;
    this.flipped.push(id);
    this.updateCardUI(id);

    if (this.flipped.length === 2) {
      this.moves++;
      this.locked = true;
      const [a, b] = this.flipped;
      if (this.cards[a].symbol === this.cards[b].symbol) {
        // Match
        this.cards[a].matched = true;
        this.cards[b].matched = true;
        this.matched++;
        this.score += 20;
        // Bonus for low moves
        this.onScore(this.score);
        this.flipped = [];
        this.locked = false;
        this.updateStatus();
        this.updateCardUI(a);
        this.updateCardUI(b);

        if (this.matched === this.getPairCount()) {
          this.finish();
        }
      } else {
        // No match
        setTimeout(() => {
          this.cards[a].flipped = false;
          this.cards[b].flipped = false;
          this.updateCardUI(a);
          this.updateCardUI(b);
          this.flipped = [];
          this.locked = false;
          this.updateStatus();
        }, 700);
      }
    } else {
      this.updateStatus();
    }
  }

  updateCardUI(id) {
    const el = this.board.querySelector(`[data-id="${id}"]`);
    if (!el) return;
    const card = this.cards[id];
    const front = el.querySelector('.card-front');
    const back = el.querySelector('.card-back');
    if (card.flipped || card.matched) {
      el.classList.add('flipped');
      if (card.matched) el.classList.add('matched');
      front.style.display = 'block';
      back.style.display = 'none';
    } else {
      el.classList.remove('flipped', 'matched');
      front.style.display = 'none';
      back.style.display = 'block';
    }
  }

  updateStatus() {
    const status = document.getElementById('memory-status');
    if (status) {
      status.textContent = `Moves: ${this.moves} | Matched: ${this.matched} / ${this.getPairCount()}`;
    }
  }

  finish() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    // Score: base + time bonus + moves efficiency
    const timeBonus = Math.max(0, 120 - elapsed) * 2;
    const moveBonus = Math.max(0, (this.getPairCount() * 2 - this.moves) * 5);
    this.score += timeBonus + moveBonus;
    this.onScore(this.score);
    this.onWin({
      score: this.score,
      message: `Matched in ${this.moves} moves (${elapsed}s)`,
    });
  }

  destroy() {
    if (this.timerId) clearInterval(this.timerId);
    this.container.innerHTML = '';
  }
}
window.MemoryGame = MemoryGame;

class RPSGame {
  constructor(container, options = {}) {
    this.container = container;
    this.onScore = options.onScore || (() => {});
    this.onWin = options.onWin || (() => {});
    this.onGameOver = options.onGameOver || (() => {});
    this.difficulty = options.difficulty || 'medium';

    this.choices = ['rock', 'paper', 'scissors'];
    this.icons = { rock: '🪨', paper: '📄', scissors: '✂️' };
    this.names = { rock: 'Rock', paper: 'Paper', scissors: 'Scissors' };

    this.playerScore = 0;
    this.computerScore = 0;
    this.round = 0;
    this.targetWins = 3; // First to 3
    this.locked = false;
  }

  getTarget() {
    // Difficulty affects how many wins needed? Or AI bias
    // We'll use AI bias for difficulty
    return 3;
  }

  setDifficulty(diff) {
    this.difficulty = diff;
  }

  // AI chooses with bias based on difficulty
  computerChoice(playerLast = null) {
    if (this.difficulty === 'easy') {
      // Random, slight bias against winning
      return this.choices[Math.floor(Math.random() * 3)];
    }
    if (this.difficulty === 'hard' && playerLast) {
      // Counter the player's last move more often
      const counters = { rock: 'paper', paper: 'scissors', scissors: 'rock' };
      if (Math.random() < 0.55) return counters[playerLast];
    }
    // Medium / fallback: pure random
    return this.choices[Math.floor(Math.random() * 3)];
  }

  start() {
    this.reset();
  }

  reset() {
    this.playerScore = 0;
    this.computerScore = 0;
    this.round = 0;
    this.locked = false;
    this.lastPlayer = null;
    this.onScore(0);
    this.render();
  }

  render() {
    this.container.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'rps-container';

    const title = document.createElement('p');
    title.style.color = 'var(--text-muted)';
    title.textContent = `First to ${this.getTarget()} wins`;
    wrap.appendChild(title);

    const scoreBoard = document.createElement('div');
    scoreBoard.className = 'rps-score-board';
    scoreBoard.innerHTML = `
      <div>You<br><strong id="rps-p-score">${this.playerScore}</strong></div>
      <div>Computer<br><strong id="rps-c-score">${this.computerScore}</strong></div>
    `;
    wrap.appendChild(scoreBoard);

    const result = document.createElement('div');
    result.className = 'rps-result';
    result.id = 'rps-result';
    result.textContent = 'Choose your move!';
    wrap.appendChild(result);

    const vs = document.createElement('div');
    vs.className = 'rps-vs';
    vs.id = 'rps-vs';
    vs.innerHTML = `<span id="rps-player-icon">❔</span><span style="font-size:1rem;color:var(--text-muted)">vs</span><span id="rps-comp-icon">❔</span>`;
    wrap.appendChild(vs);

    const choices = document.createElement('div');
    choices.className = 'rps-choices';
    this.choices.forEach((c) => {
      const btn = document.createElement('button');
      btn.className = 'rps-btn';
      btn.textContent = this.icons[c];
      btn.title = this.names[c];
      btn.dataset.choice = c;
      btn.addEventListener('click', () => this.play(c));
      choices.appendChild(btn);
    });
    wrap.appendChild(choices);

    this.container.appendChild(wrap);
  }

  play(playerChoice) {
    if (this.locked) return;
    this.locked = true;
    this.round++;

    const compChoice = this.computerChoice(this.lastPlayer);
    this.lastPlayer = playerChoice;

    // Show choices
    document.getElementById('rps-player-icon').textContent = this.icons[playerChoice];
    document.getElementById('rps-comp-icon').textContent = this.icons[compChoice];

    const resultEl = document.getElementById('rps-result');
    const outcome = this.getOutcome(playerChoice, compChoice);

    if (outcome === 'win') {
      this.playerScore++;
      resultEl.innerHTML = `<span style="color:var(--success)">You win!</span> ${this.names[playerChoice]} beats ${this.names[compChoice]}`;
    } else if (outcome === 'lose') {
      this.computerScore++;
      resultEl.innerHTML = `<span style="color:var(--accent-2)">You lose</span> ${this.names[compChoice]} beats ${this.names[playerChoice]}`;
    } else {
      resultEl.textContent = `Draw! Both chose ${this.names[playerChoice]}`;
    }

    document.getElementById('rps-p-score').textContent = this.playerScore;
    document.getElementById('rps-c-score').textContent = this.computerScore;

    // Score for high score = player wins in a match (or total rounds won across sessions? Use match wins)
    this.onScore(this.playerScore);

    const target = this.getTarget();
    if (this.playerScore >= target) {
      setTimeout(() => {
        this.onWin({
          score: this.playerScore,
          message: `You won the match ${this.playerScore}-${this.computerScore}`,
        });
      }, 600);
      return;
    }
    if (this.computerScore >= target) {
      setTimeout(() => {
        this.onGameOver({
          score: this.playerScore,
          message: `Computer won ${this.computerScore}-${this.playerScore}`,
        });
      }, 600);
      return;
    }

    // Unlock after short delay
    setTimeout(() => {
      this.locked = false;
    }, 800);
  }

  getOutcome(player, comp) {
    if (player === comp) return 'draw';
    if (
      (player === 'rock' && comp === 'scissors') ||
      (player === 'paper' && comp === 'rock') ||
      (player === 'scissors' && comp === 'paper')
    ) {
      return 'win';
    }
    return 'lose';
  }

  destroy() {
    this.container.innerHTML = '';
  }
}
window.RPSGame = RPSGame;

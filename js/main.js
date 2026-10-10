(function () {
  const GAMES = {
    snake: { name: 'Snake', class: window.SnakeGame },
    breakout: { name: 'Breakout', class: window.BreakoutGame },
    memory: { name: 'Memory', class: window.MemoryGame },
    tictactoe: { name: 'Tic-Tac-Toe', class: window.TicTacToeGame },
    rps: { name: 'Rock Paper Scissors', class: window.RPSGame },
  };

  const HIGH_SCORE_KEYS = {
    snake: 'arcade_hs_snake',
    breakout: 'arcade_hs_breakout',
    memory: 'arcade_hs_memory',
    tictactoe: 'arcade_hs_tictactoe',
    rps: 'arcade_hs_rps',
  };

  let currentGame = null;
  let currentGameId = null;

  // DOM refs
  const mainMenu = document.getElementById('main-menu');
  const gameContainer = document.getElementById('game-container');
  const gameArea = document.getElementById('game-area');
  const gameTitle = document.getElementById('game-title');
  const scoreDisplay = document.getElementById('score-display');
  const highScoreDisplay = document.getElementById('high-score-display');
  const difficultySelect = document.getElementById('difficulty-select');
  const btnRestart = document.getElementById('btn-restart');
  const btnBack = document.getElementById('btn-back');
  const btnPause = document.getElementById('btn-pause');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlay-title');
  const overlayScore = document.getElementById('overlay-score');
  const overlayMessage = document.getElementById('overlay-message');
  const overlayRestart = document.getElementById('overlay-restart');
  const overlayMenu = document.getElementById('overlay-menu');
  const highScoresPreview = document.getElementById('high-scores-preview');

  // ===== High Score Helpers =====
  function getHighScore(gameId) {
    return parseInt(localStorage.getItem(HIGH_SCORE_KEYS[gameId]) || '0', 10);
  }

  function setHighScore(gameId, score) {
    const current = getHighScore(gameId);
    if (score > current) {
      localStorage.setItem(HIGH_SCORE_KEYS[gameId], String(score));
      return true;
    }
    return false;
  }

  function renderHighScoresPreview() {
    let html = '<h3>🏆 High Scores</h3>';
    for (const [id, info] of Object.entries(GAMES)) {
      const hs = getHighScore(id);
      html += '<div class="hs-row"><span>' + info.name + '</span><span>' + hs + '</span></div>';
    }
    highScoresPreview.innerHTML = html;
  }

  // ===== UI Helpers =====
  function updateScore(score) {
    scoreDisplay.textContent = 'Score: ' + score;
  }

  function updateHighScoreDisplay(gameId) {
    highScoreDisplay.textContent = 'Best: ' + getHighScore(gameId);
  }

  function showOverlay(title, score, message, isWin) {
    overlayTitle.textContent = title;
    overlayTitle.className = isWin ? 'win' : 'lose';
    overlayScore.textContent = score != null ? 'Score: ' + score : '';
    overlayMessage.textContent = message || '';
    overlay.style.display = 'flex';
  }

  function hideOverlay() {
    overlay.style.display = 'none';
  }

  function showScreen(screen) {
    mainMenu.classList.remove('active');
    gameContainer.classList.remove('active');
    screen.classList.add('active');
  }

  // ===== Game Lifecycle =====
  function startGame(gameId) {
    if (currentGame) {
      currentGame.destroy();
      currentGame = null;
    }

    currentGameId = gameId;
    const info = GAMES[gameId];
    gameTitle.textContent = info.name;
    updateScore(0);
    updateHighScoreDisplay(gameId);

    gameArea.innerHTML = '';
    hideOverlay();

    const difficulty = difficultySelect.value;
    const GameClass = info.class;
    currentGame = new GameClass(gameArea, {
      difficulty: difficulty,
      onScore: function (s) { updateScore(s); },
      onGameOver: function (result) { handleGameOver(result); },
      onWin: function (result) { handleWin(result); },
    });

    currentGame.start();
    showScreen(gameContainer);

    const pauseable = gameId === 'snake' || gameId === 'breakout';
    btnPause.style.display = pauseable ? 'inline-block' : 'none';
    btnPause.textContent = 'Pause';
  }

  function handleGameOver(result) {
    const score = (result && result.score) || 0;
    const message = (result && result.message) || 'Game Over';
    const isNew = setHighScore(currentGameId, score);
    updateHighScoreDisplay(currentGameId);
    showOverlay('Game Over', score, isNew ? '🎉 New High Score!' : message, false);
  }

  function handleWin(result) {
    const score = (result && result.score) || 0;
    const message = (result && result.message) || 'You Win!';
    const isNew = setHighScore(currentGameId, score);
    updateHighScoreDisplay(currentGameId);
    showOverlay('You Win!', score, isNew ? '🎉 New High Score!' : message, true);
  }

  function restartCurrent() {
    if (!currentGameId) return;
    hideOverlay();
    startGame(currentGameId);
  }

  function goToMenu() {
    if (currentGame) {
      currentGame.destroy();
      currentGame = null;
    }
    currentGameId = null;
    hideOverlay();
    renderHighScoresPreview();
    showScreen(mainMenu);
  }

  // ===== Event Listeners =====
  document.querySelectorAll('.menu-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      startGame(btn.dataset.game);
    });
  });

  btnBack.addEventListener('click', goToMenu);
  btnRestart.addEventListener('click', restartCurrent);
  overlayRestart.addEventListener('click', restartCurrent);
  overlayMenu.addEventListener('click', goToMenu);

  difficultySelect.addEventListener('change', function () {
    if (currentGameId) {
      restartCurrent();
    }
  });

  btnPause.addEventListener('click', function () {
    if (!currentGame || !currentGame.togglePause) return;
    const paused = currentGame.togglePause();
    btnPause.textContent = paused ? 'Resume' : 'Pause';
  });

  // Init
  renderHighScoresPreview();
  showScreen(mainMenu);
})();

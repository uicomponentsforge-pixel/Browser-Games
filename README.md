# 🎮 Arcade Hub — Browser Games

Arcade Hub is a clean, lightweight web-based arcade gaming platform containing 5 classic games built with vanilla JavaScript, HTML5 Canvas, and CSS.

---

## 🌟 Features

- **5 Classic Arcade Games**: Snake, Breakout, Memory Card Match, Tic-Tac-Toe, and Rock Paper Scissors.
- **Difficulty Settings**: Easy, Medium, and Hard modes available for all games.
- **High Score Persistence**: High scores are saved locally using browser `localStorage` and showcased on the main menu.
- **Controls & Pause**: Pause and resume real-time action games like Snake and Breakout.
- **Zero External Dependencies**: Pure HTML, CSS, and Vanilla JavaScript with no frameworks or build steps required.

---

## 🕹️ Included Games & Controls

### 🐍 Snake
- **Description**: Control the growing snake to eat food and gain points without crashing into walls or yourself.
- **Controls**:
  - Arrow Keys (`↑`, `↓`, `←`, `→`) or `WASD` to turn.
  - `Pause` button in the UI to pause/resume game.

### 🧱 Breakout
- **Description**: Bounce the ball off the paddle to break all the bricks on the screen.
- **Controls**:
  - Arrow Keys (`←`, `→`) / `A` / `D` or Mouse Movement to move the paddle.
  - `Pause` button in the UI to pause/resume game.

### 🧠 Memory
- **Description**: Flip cards to find matching emoji pairs with minimal moves and time.
- **Controls**:
  - Click on cards to flip them.

### ❌⭕ Tic-Tac-Toe
- **Description**: Play against an AI opponent on a 3x3 grid. Choose your difficulty level to adjust AI strategy!
- **Controls**:
  - Click on any empty cell to place your `X`.

### 🪨📄✂️ Rock Paper Scissors
- **Description**: Play "First to 3" wins against the computer with varying AI difficulties.
- **Controls**:
  - Click on Rock, Paper, or Scissors icons to make your choice.

---

## 🚀 How to Run

Because Arcade Hub uses standalone static files, no installation or compilation step is needed.

1. **Open `index.html` directly in any web browser**:
   - Double-click `index.html` in your file browser, or drag and drop it into a web browser window.
2. **Alternatively, serve via a local HTTP web server**:
   - Using Python 3:
     ```bash
     python3 -m http.server 8000
     ```
     Then open `http://localhost:8000` in your browser.
   - Using Node.js (`npx serve` or `http-server`):
     ```bash
     npx serve .
     ```

---

## 📁 Project Structure

```
├── index.html         # Main HTML page & layout
├── css/
│   └── styles.css     # UI styling & game visual layout
└── js/
    ├── main.js        # Main app logic, UI management, & high score system
    ├── snake.js       # Snake game logic
    ├── breakout.js    # Breakout game logic
    ├── memory.js      # Memory card match game logic
    ├── tictactoe.js   # Tic-Tac-Toe game logic with Minimax AI
    └── rps.js         # Rock Paper Scissors game logic
```

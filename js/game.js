/* Lis Look Game: earlier or later?
   Looks come from js/looks-data.js. Score grows with a streak multiplier,
   the best score is remembered (account or this browser). */

const STARTING_LIVES = 3;
const WIN_STREAK = 8;
const BASE_POINTS = 10;
const HIGHER = "higher";
const LOWER = "lower";
const GUEST_BEST_KEY = "lis-game-best";

const REGION_CLASSES = ["arch--paris", "arch--europe", "arch--america", "arch--kazakh"];

const livesEl = document.getElementById("lives");
const streakEl = document.getElementById("streak");
const bestEl = document.getElementById("best");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("bestScore");
const multEl = document.getElementById("multiplier");
const accuracyEl = document.getElementById("accuracy");
const messageEl = document.getElementById("message");
const factEl = document.getElementById("fact");
const higherBtn = document.getElementById("higherBtn");
const lowerBtn = document.getElementById("lowerBtn");
const restartBtn = document.getElementById("restartBtn");
const overEl = document.getElementById("gameOver");
const overTitleEl = document.getElementById("overTitle");
const overTextEl = document.getElementById("overText");
const overSaveEl = document.getElementById("overSave");
const currentCard = document.getElementById("currentCard");
const nextCard = document.getElementById("nextCard");
const roundsList = document.getElementById("rounds");

const state = {
  lives: STARTING_LIVES,
  streak: 0,
  best: 0,
  score: 0,
  bestScore: 0,
  guesses: 0,
  correct: 0,
  current: null,
  next: null,
  over: false
};

function loadBestScore() {
  const user = LisAuth.currentUser();
  return user ? (user.bestScore || 0) : LisStore.get(GUEST_BEST_KEY, 0);
}

function saveBestScore(score) {
  const user = LisAuth.currentUser();
  if (user) LisAuth.update({ bestScore: score });
  else LisStore.set(GUEST_BEST_KEY, score);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickLook(exclude) {
  let look;
  do {
    look = LOOKS[randomInt(0, LOOKS.length - 1)];
  } while (look === exclude);
  return look;
}

// multiplier rises every 3 correct answers in a row: x1, x2, x3...
function multiplier(streak) {
  return 1 + Math.floor(streak / 3);
}

function isCorrect(guess, current, next) {
  return (guess === HIGHER && next.decade >= current.decade) ||
         (guess === LOWER && next.decade <= current.decade);
}

function setMessage(text, type) {
  messageEl.textContent = text;
  messageEl.classList.remove("is-success", "is-error", "is-warning");
  if (type) {
    messageEl.classList.add("is-" + type);
  }
}

function decadeLabel(look) {
  return look.era === "Heritage" ? "heritage (around 1900)" : look.era === "Today" ? "2020s" : look.era;
}

function renderCard(figure, look, showDecade) {
  const img = figure.querySelector("img");
  const caption = figure.querySelector("figcaption");
  REGION_CLASSES.forEach((name) => figure.classList.remove(name));
  figure.classList.add("arch--" + look.wardrobe);
  img.src = look.image;
  img.alt = look.alt;
  caption.textContent = showDecade ? look.name + " · " + decadeLabel(look) : look.name + " · ?";
  figure.classList.toggle("is-hidden-year", !showDecade);
}

function renderLives() {
  livesEl.replaceChildren();
  for (let i = 0; i < STARTING_LIVES; i += 1) {
    const heart = document.createElement("span");
    heart.className = i < state.lives ? "heart" : "heart heart--empty";
    heart.textContent = "♥";
    livesEl.appendChild(heart);
  }
  livesEl.setAttribute("aria-label", state.lives + " of " + STARTING_LIVES + " lives left");
}

function render() {
  renderLives();
  streakEl.textContent = state.streak;
  bestEl.textContent = state.best;
  scoreEl.textContent = state.score;
  bestScoreEl.textContent = state.bestScore;
  multEl.textContent = "×" + multiplier(state.streak);
  multEl.classList.toggle("is-hot", multiplier(state.streak) > 1);
  accuracyEl.textContent = state.guesses ? Math.round((state.correct / state.guesses) * 100) + "%" : "—";
  renderCard(currentCard, state.current, true);
  renderCard(nextCard, state.next, false);
  higherBtn.disabled = state.over;
  lowerBtn.disabled = state.over;
  overEl.classList.toggle("is-visible", state.over);
}

// jQuery: "+20" floats up from the score and fades out
function floatPoints(text, good) {
  const $pop = $("<span>", { class: "score-pop" + (good ? "" : " score-pop--bad"), text: text, "aria-hidden": "true" });
  $(scoreEl).closest(".game__stat").append($pop);
  $pop.animate({ top: "-2.2rem", opacity: 0 }, 900, function () { $(this).remove(); });
}

function addRound(previous, revealed, guess, ok, points) {
  const li = document.createElement("li");
  li.className = ok ? "round round--ok" : "round round--bad";
  li.textContent = (ok ? "✓ " : "✗ ") + revealed.name + " (" + decadeLabel(revealed) + ") was " +
    (guess === HIGHER ? "later" : "earlier") + " than " + previous.name + "? " + (ok ? "+" + points : "−1 life");
  roundsList.prepend(li);
  while (roundsList.children.length > 6) roundsList.lastChild.remove();
  $(li).hide().slideDown(200);
}

function endGame(won, lastLook) {
  state.over = true;
  overEl.classList.toggle("is-win", won);
  overEl.classList.toggle("is-loss", !won);
  overTitleEl.textContent = won ? "You won!" : "Game over";
  const accuracy = state.guesses ? Math.round((state.correct / state.guesses) * 100) : 0;
  overTextEl.textContent = (won
    ? "A streak of " + WIN_STREAK + " correct guesses. "
    : "No lives left. The last look was from the " + decadeLabel(lastLook) + ". ") +
    "Score " + state.score + ", accuracy " + accuracy + "%, best streak " + state.best + ".";

  const isRecord = state.score > 0 && state.score >= state.bestScore;
  const user = LisAuth.currentUser();
  overSaveEl.innerHTML = "";
  if (isRecord) {
    overSaveEl.append(user ? "New personal best! It is saved to your account." : "New best score in this browser. ");
    if (!user) {
      const a = document.createElement("a");
      a.href = "account.html#signup";
      a.textContent = "Create an account to keep it.";
      overSaveEl.append(a);
    }
  }
  $(overEl).hide().fadeIn(300);
}

function handleGuess(guess) {
  if (state.over) {
    setMessage("The game is over. Press Play again to start a new one.", "warning");
    return;
  }

  const revealed = state.next;
  const previous = state.current;
  const fact = revealed.name + " is from the " + decadeLabel(revealed) + ", " + previous.name + " is from the " + decadeLabel(previous) + ".";
  state.guesses += 1;

  if (isCorrect(guess, previous, revealed)) {
    const points = BASE_POINTS * multiplier(state.streak);
    state.streak += 1;
    state.correct += 1;
    state.score += points;
    if (state.streak > state.best) state.best = state.streak;
    if (state.score > state.bestScore) {
      state.bestScore = state.score;
      saveBestScore(state.bestScore);
    }
    setMessage("Correct! +" + points + " points. " + fact, "success");
    floatPoints("+" + points, true);
    addRound(previous, revealed, guess, true, points);
  } else {
    state.lives -= 1;
    state.streak = 0;
    setMessage("Wrong. " + fact, "error");
    floatPoints("−1 ♥", false);
    addRound(previous, revealed, guess, false, 0);
  }

  // history note for the look that was just revealed
  factEl.textContent = revealed.keyMoment;
  $(factEl).closest(".game__fact").stop(true, true).hide().fadeIn(300);

  state.current = revealed;

  if (state.streak === WIN_STREAK) {
    endGame(true, revealed);
  } else if (state.lives === 0) {
    endGame(false, revealed);
  }

  state.next = pickLook(state.current);
  render();
  if (state.over) restartBtn.focus();
}

function startGame() {
  Object.assign(state, {
    lives: STARTING_LIVES, streak: 0, best: 0, score: 0, guesses: 0, correct: 0, over: false,
    bestScore: loadBestScore()
  });
  state.current = pickLook(null);
  state.next = pickLook(state.current);
  overEl.classList.remove("is-win", "is-loss");
  roundsList.innerHTML = "";
  $(".game__fact").hide();
  setMessage("Is the next look from a later or an earlier decade? Equal decades count as correct.", "");
  render();
}

higherBtn.addEventListener("click", () => handleGuess(HIGHER));
lowerBtn.addEventListener("click", () => handleGuess(LOWER));
restartBtn.addEventListener("click", () => { startGame(); higherBtn.focus(); });

document.addEventListener("keydown", (event) => {
  if (event.target.closest("input, select, textarea")) return;
  if (event.key === "ArrowUp") {
    event.preventDefault();
    handleGuess(HIGHER);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    handleGuess(LOWER);
  }
});

startGame();

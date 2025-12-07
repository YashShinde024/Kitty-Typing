import {
  initializeApp,
  getApps,
  getApp,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ✅ Same Firebase project as login/register
const firebaseConfig = {
  apiKey: "AIzaSyA98nAIBFY661DgyYsSRefqhZD8lyDtOL0",
  authDomain: "kitty-type.firebaseapp.com",
  projectId: "kitty-type",
  storageBucket: "kitty-type.firebasestorage.app",
  messagingSenderId: "612284520712",
  appId: "1:612284520712:web:992d87ad71131d03a0f4bd",
};

// ✅ Safe init (won’t crash if already initialized elsewhere)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Wait for DOM ready
window.addEventListener("DOMContentLoaded", () => {
  console.log("Typing script loaded & DOM ready");

  const typingTextEl = document.getElementById("typing-text");
  const timeLeftEl = document.getElementById("time-left");
  const wpmEl = document.getElementById("wpm");
  const accuracyEl = document.getElementById("accuracy");
  const charactersEl = document.getElementById("characters");
  const startBtn = document.getElementById("start-test");
  const resetBtn = document.getElementById("reset-test");
  const changeTextBtn = document.getElementById("change-text");

  const bestScoreEl = document.querySelector(
    ".hero-metrics .metric .metric-value"
  );
  const avgAccuracyPill = document.querySelector(
    ".hero-metrics .metric-inline .metric-pill"
  );
  const totalTestsPill = document.querySelector(
    ".hero-metrics .metric-inline .metric-pill-soft"
  );

  // Guard: if core element missing, stop
  if (!typingTextEl || !timeLeftEl || !startBtn) {
    console.error("Typing page elements not found. Check IDs in HTML.");
    return;
  }

  // Hidden textarea for blind typing
  const hiddenInput = document.createElement("textarea");
  hiddenInput.id = "blind-input";
  hiddenInput.autocomplete = "off";
  hiddenInput.spellcheck = false;
  hiddenInput.style.position = "fixed";
  hiddenInput.style.opacity = "0";
  hiddenInput.style.pointerEvents = "none";
  hiddenInput.style.left = "-9999px";
  hiddenInput.style.top = "0";
  document.body.appendChild(hiddenInput);

  const paragraphs = {
    easy: [
      "Type calm simple words to build clean accuracy and confidence.",
      "Practice every day to slowly increase your typing speed and control.",
      "Focus on each letter and let your fingers learn the basic patterns.",
      "Blue skies and white clouds make for a perfect summer afternoon.",
      "Reading books is a great way to learn new words and ideas.",
      "Walk slowly and breathe deeply to relax your mind and body.",
      "Green grass grows quickly after a heavy rain in the spring.",
      "Simple habits can lead to big changes in your daily life.",
      "Keep your hands light and your posture straight for best results.",
      "Fresh fruit is good for your health and keeps you strong.",
    ],
    medium: [
      "The quick brown fox jumps over the lazy dog and tests your rhythm.",
      "Consistent practice with medium sentences builds stable confidence.",
      "Typing without looking at the screen sharpens your muscle memory.",
      "The journey of a thousand miles begins with a single step forward.",
      "Digital landscapes change constantly, requiring us to adapt and learn.",
      "Solving puzzles helps to keep the brain sharp and active as we age.",
      "Creative thinking involves looking at problems from a new perspective.",
      "Effective communication is the key to building strong relationships.",
      "A hot cup of coffee in the morning helps to clear the foggy mind.",
      "Music has the power to change our mood and lift our spirits instantly.",
    ],
    hard: [
      "Punctuation, commas, and hyphens demand deliberate precision and focus.",
      "Blind typing forces the brain and fingers to coordinate under pressure.",
      "Complex phrases with mixed length words challenge your pacing and control.",
      "Algorithm efficiency is often measured by time complexity; O(n) is ideal.",
      "Synthesizing data from multiple sources requires critical analysis.",
      "The juxtaposition of light and shadow created a dramatic, eerie effect.",
      "Neuroplasticity refers to the brain's ability to reorganize itself.",
      "Unexpected error: line 42 contains an invalid character or missing delimiter.",
      "Debugging is like being the detective in a crime movie where you are also the murderer.",
      "To be, or not to be: that is the question: Whether 'tis nobler in the mind.",
    ],
    challenge: [
      "Swiftly synchronize thoughts and fingers to maintain blazing speed with accuracy.",
      "Complex punctuation heavy sentences reveal the limits of your typing mastery.",
      "Sustain high velocity while navigating intricate word patterns and symbols.",
      "Sphinx of black quartz, judge my vow; a pangram containing every letter.",
      "While 12.5% of the population agrees, the remaining 87.5% require empirical evidence.",
      "Character encoding standards like UTF-8 allow for the representation of global languages.",
      "The five boxing wizards jump quickly, creating a dizzying display of magical prowess.",
      "Asynchronous JavaScript and XML, known as AJAX, allows for dynamic content updates.",
      "A rough-coated, dough-faced, thoughtful ploughman strode through the streets of Scarborough.",
      "Pack my box with five dozen liquor jugs; it is the ultimate test of finger dexterity.",
    ],
  };

  let difficulty = localStorage.getItem("bt_difficulty") || "medium";
  let history = JSON.parse(localStorage.getItem("bt_history") || "[]");

  let timeLimit = 60;
  let timerId = null;
  let remaining = timeLimit;
  let testRunning = false;
  let testStartTime = null;
  let lastStats = { wpm: 0, accuracy: 0, characters: 0 };
  let currentUser = null;

  let currentParagraph = "";
  let charSpans = [];

  function renderParagraph(text) {
    typingTextEl.innerHTML = "";
    charSpans = [];
    text.split("").forEach((ch) => {
      const span = document.createElement("span");
      span.textContent = ch;
      span.classList.add("char");
      typingTextEl.appendChild(span);
      charSpans.push(span);
    });
    currentParagraph = text;
  }

  function chooseParagraph() {
    const levelList = paragraphs[difficulty] || paragraphs.medium;
    const index = Math.floor(Math.random() * levelList.length);
    const text = levelList[index];
    renderParagraph(text);
  }

  function saveHistoryLocal(entry) {
    history.push(entry);
    if (history.length > 10) history = history.slice(-10);
    localStorage.setItem("bt_history", JSON.stringify(history));
  }

  function recomputeDifficulty() {
    if (history.length === 0) {
      difficulty = "medium";
      localStorage.setItem("bt_difficulty", difficulty);
      return;
    }
    const last = history[history.length - 1];
    const lastAcc = last.accuracy;
    const lastWpm = last.wpm;
    const recent = history.slice(-3);
    const fastCount = recent.filter(
      (h) => h.wpm >= 50 && h.accuracy >= 85
    ).length;

    if (lastAcc < 80) {
      difficulty = "easy";
    } else if (fastCount === 3) {
      difficulty = "challenge";
    } else if (lastWpm >= 40 && lastAcc >= 82) {
      difficulty = "hard";
    } else {
      difficulty = "medium";
    }
    localStorage.setItem("bt_difficulty", difficulty);
  }

  function updateCoachMessage() {
    let coach = document.getElementById("coach-message");
    if (!coach) {
      coach = document.createElement("p");
      coach.id = "coach-message";
      coach.style.marginTop = "0.5rem";
      coach.style.fontSize = "0.8rem";
      coach.style.color = "#9ca3af";
      const wrapper = document.querySelector(".typing-wrapper");
      if (wrapper) wrapper.appendChild(coach);
    }

    let msg = "";
    if (!history.length) {
      msg =
        "Coach: Starting at medium difficulty. Focus on staying relaxed and accurate.";
    } else if (difficulty === "easy") {
      msg =
        "Coach: Your accuracy dipped, so we simplified the text. Aim for clean, error free typing.";
    } else if (difficulty === "medium") {
      msg = "Coach: Solid baseline. Keep a balance of speed and accuracy.";
    } else if (difficulty === "hard") {
      msg =
        "Coach: You are handling this well. More complex sentences unlocked for extra challenge.";
    } else if (difficulty === "challenge") {
      msg =
        "Coach: Challenge Mode activated. High complexity and tighter pacing. Stay sharp.";
    }
    coach.textContent = msg;
  }

  // ⏱ time selection buttons (60 / 120 / custom)
  function setTimeLimitFromButtons() {
    const btn60 = document.getElementById("btn-60");
    const btn120 = document.getElementById("btn-120");
    const customBtn = document.getElementById("custom-time");

    function setActiveButton(active) {
      [btn60, btn120, customBtn].forEach((btn) => {
        if (!btn) return;
        if (btn === active) {
          btn.classList.add("chip-primary");
          btn.classList.remove("chip-soft");
        } else {
          btn.classList.add("chip-soft");
          btn.classList.remove("chip-primary");
        }
      });
    }

    if (btn60) {
      btn60.addEventListener("click", () => {
        timeLimit = 60;
        remaining = timeLimit;
        timeLeftEl.textContent = timeLimit;
        setActiveButton(btn60);
      });
    }

    if (btn120) {
      btn120.addEventListener("click", () => {
        timeLimit = 120;
        remaining = timeLimit;
        timeLeftEl.textContent = timeLimit;
        setActiveButton(btn120);
      });
    }

    if (customBtn) {
      customBtn.addEventListener("click", () => {
        const input = prompt(
          "Enter custom time in seconds (10–600):",
          String(timeLimit)
        );
        if (!input) return;

        const val = parseInt(input, 10);
        if (Number.isNaN(val) || val < 10 || val > 600) {
          alert("Please enter a number between 10 and 600.");
          return;
        }

        timeLimit = val;
        remaining = timeLimit;
        timeLeftEl.textContent = timeLimit;
        setActiveButton(customBtn);
      });
    }
  }

  // ✅ Highlight the next character to type
  function updateHighlight(typed) {
    if (!charSpans.length) return;
    const len = typed.length;

    for (let i = 0; i < charSpans.length; i++) {
      const span = charSpans[i];
      span.classList.remove("current");
      if (i === len) {
        span.classList.add("current");
      }
    }
  }

  function resetStatsUI() {
    wpmEl.textContent = "0";
    accuracyEl.textContent = "0%";
    charactersEl.textContent = "0";
    remaining = timeLimit;
    timeLeftEl.textContent = remaining;
    updateHighlight("");
  }

  function computeStats() {
    const target = currentParagraph || typingTextEl.textContent || "";
    const typed = hiddenInput.value || "";
    const charsTyped = typed.length;
    charactersEl.textContent = String(charsTyped);

    updateHighlight(typed);

    if (!testStartTime || charsTyped === 0) {
      wpmEl.textContent = "0";
      accuracyEl.textContent = "0%";
      lastStats = { wpm: 0, accuracy: 0, characters: charsTyped };
      return;
    }
    let correctChars = 0;
    const maxIndex = Math.min(charsTyped, target.length);
    for (let i = 0; i < maxIndex; i++) {
      if (typed[i] === target[i]) correctChars++;
    }
    const accuracy = charsTyped ? (correctChars / charsTyped) * 100 : 0;
    const words = typed.trim().length
      ? typed.trim().split(/\s+/).length
      : 0;
    const elapsedMs = Date.now() - testStartTime;
    const elapsedMinutes = elapsedMs / 1000 / 60 || 1;
    const wpm = Math.round(words / elapsedMinutes);

    wpmEl.textContent = String(wpm);
    accuracyEl.textContent = `${accuracy.toFixed(0)}%`;
    lastStats = { wpm, accuracy, characters: charsTyped };
  }

  function startTimer() {
    if (timerId) clearInterval(timerId);
    remaining = timeLimit;
    timeLeftEl.textContent = remaining;
    testStartTime = Date.now();
    timerId = setInterval(() => {
      remaining -= 1;
      if (remaining < 0) remaining = 0;
      timeLeftEl.textContent = remaining;
      if (remaining <= 0) {
        endTest();
      }
    }, 1000);
  }

  function startTest() {
    if (testRunning) return;
    testRunning = true;
    hiddenInput.value = "";
    hiddenInput.focus();
    resetStatsUI();
    startTimer();
  }

  async function saveTestToBackend(entry) {
    if (!currentUser) {
      console.warn("No currentUser, skipping Firestore save");
      return;
    }
    const uid = currentUser.uid;
    try {
      const docRef = await addDoc(collection(db, "users", uid, "tests"), {
        wpm: entry.wpm,
        accuracy: entry.accuracy,
        characters: entry.characters,
        difficulty: entry.difficulty,
        timeLimit: entry.timeLimit,
        createdAt: serverTimestamp(),
      });
      console.log("Test doc created with id:", docRef.id);

      const statsRef = doc(db, "users", uid);
      const snap = await getDoc(statsRef);
      if (!snap.exists()) {
        await setDoc(statsRef, {
          bestWpm: entry.wpm,
          avgAccuracy: entry.accuracy,
          totalTests: 1,
        });
      } else {
        const data = snap.data();
        const prevBest = data.bestWpm || 0;
        const prevAvg = data.avgAccuracy || 0;
        const prevTotal = data.totalTests || 0;
        const newTotal = prevTotal + 1;
        const newBest = entry.wpm > prevBest ? entry.wpm : prevBest;
        const newAvg =
          (prevAvg * prevTotal + entry.accuracy) / newTotal;
        await updateDoc(statsRef, {
          bestWpm: newBest,
          avgAccuracy: newAvg,
          totalTests: newTotal,
        });
      }
      await loadUserStats();
    } catch (e) {
      console.error("Error saving test:", e);
    }
  }

  async function loadUserStats() {
    if (!currentUser) return;
    const uid = currentUser.uid;
    try {
      const statsRef = doc(db, "users", uid);
      const snap = await getDoc(statsRef);
      if (snap.exists()) {
        const data = snap.data();
        const bestWpm = data.bestWpm || 0;
        const avgAcc = data.avgAccuracy || 0;
        const total = data.totalTests || 0;

        if (bestScoreEl) bestScoreEl.textContent = `${bestWpm} WPM`;
        if (avgAccuracyPill)
          avgAccuracyPill.textContent = `${avgAcc.toFixed(0)}%`;
        if (totalTestsPill)
          totalTestsPill.textContent = `${total} completed`;
      }
    } catch (e) {
      console.error("Error loading stats:", e);
    }
  }

  async function endTest() {
    if (!testRunning) return;
    testRunning = false;
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    computeStats();
    const entry = {
      wpm: lastStats.wpm,
      accuracy: lastStats.accuracy,
      characters: lastStats.characters,
      difficulty,
      timeLimit,
      time: Date.now(),
    };
    saveHistoryLocal(entry);
    recomputeDifficulty();
    updateCoachMessage();
    await saveTestToBackend(entry);
  }

  function resetTest() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    testRunning = false;
    hiddenInput.value = "";
    resetStatsUI();
  }

  function initChangeText() {
    if (!changeTextBtn) return;
    changeTextBtn.addEventListener("click", () => {
      chooseParagraph();
      resetTest();
    });
  }

  function initTypingListener() {
    hiddenInput.addEventListener("input", () => {
      if (testRunning) computeStats();
    });
    window.addEventListener("keydown", (e) => {
      if (!testRunning) return;
      const isMeta = e.metaKey || e.ctrlKey || e.altKey;
      if (!isMeta) hiddenInput.focus();
    });
  }

  function initButtons() {
    if (startBtn) startBtn.addEventListener("click", startTest);
    if (resetBtn) resetBtn.addEventListener("click", resetTest);
  }

  function initAuthGuard() {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("No user logged in, redirecting to login");
        window.location.href = "index.html"; // login page
        return;
      }
      currentUser = user;
      console.log("Typing page user:", user.uid, user.email);
      await loadUserStats();
    });
  }

  function init() {
    setTimeLimitFromButtons();
    recomputeDifficulty();
    chooseParagraph();
    updateCoachMessage();
    resetStatsUI();
    initButtons();
    initChangeText();
    initTypingListener();
    initAuthGuard();
  }

  init();
});

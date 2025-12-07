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

// 1. Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyA98nAIBFY661DgyYsSRefqhZD8lyDtOL0",
  authDomain: "kitty-type.firebaseapp.com",
  projectId: "kitty-type",
  storageBucket: "kitty-type.firebasestorage.app",
  messagingSenderId: "612284520712",
  appId: "1:612284520712:web:992d87ad71131d03a0f4bd",
};

// 2. Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 3. Main Logic (Wait for DOM)
window.addEventListener("DOMContentLoaded", () => {
  console.log("Typing script loaded & DOM ready");

  // --- BLIND MODE ELEMENTS ---
  const typingTextEl = document.getElementById("typing-text");
  const timeLeftEl = document.getElementById("time-left");
  const wpmEl = document.getElementById("wpm");
  const accuracyEl = document.getElementById("accuracy");
  const charactersEl = document.getElementById("characters");
  const startBtn = document.getElementById("start-test");
  const resetBtn = document.getElementById("reset-test");
  const changeTextBtn = document.getElementById("change-text");

  // --- NORMAL MODE ELEMENTS ---
  const typingTextNormalEl = document.getElementById("typing-text-normal");
  const timeLeftNormalEl = document.getElementById("time-left-normal");
  const changeTextNormalBtn = document.getElementById("change-text-normal");
  const normalInput = document.getElementById("normal-input");
  const startBtnNormal = document.getElementById("start-test-normal");
  const resetBtnNormal = document.getElementById("reset-test-normal");

  // --- NORMAL MODE STATS (The unique IDs you added) ---
  const wpmNormalEl = document.getElementById("wpm-normal");
  const accuracyNormalEl = document.getElementById("accuracy-normal");
  const charactersNormalEl = document.getElementById("characters-normal");

  // --- HERO METRICS ---
  const bestScoreEl = document.querySelector(".hero-metrics .metric .metric-value");
  const avgAccuracyPill = document.querySelector(".hero-metrics .metric-inline .metric-pill");
  const totalTestsPill = document.querySelector(".hero-metrics .metric-inline .metric-pill-soft");

  // Create Hidden Input for Blind Mode
  const hiddenInput = document.createElement("textarea");
  hiddenInput.id = "blind-input";
  hiddenInput.style.position = "fixed";
  hiddenInput.style.opacity = "0";
  hiddenInput.style.left = "-9999px";
  document.body.appendChild(hiddenInput);

  // ========== USER PROFILE: NAME + AVATAR ==========

// Grab elements from your existing HTML
const userNameEl = document.querySelector(".user-name");
const userAvatarEl = document.querySelector(".user-avatar");

onAuthStateChanged(auth, (user) => {
  if (user) {
    // ---------- NAME ----------
    let name = user.displayName;

    // If no displayName, fallback to part before @ in email
    if (!name && user.email) {
      name = user.email.split("@")[0];
    }

    // Final fallback
    name = name || "User";
    userNameEl.textContent = name;

    // ---------- AVATAR ----------
    if (user.photoURL) {
      // Google / provider profile picture
      userAvatarEl.src = user.photoURL;
    } else {
      // No photo → generate initial avatar from first letter
      const initial = name.charAt(0).toUpperCase();
      userAvatarEl.src = generateInitialAvatar(initial);
    }
  } else {
    // Not logged in
    userNameEl.textContent = "Guest";
    userAvatarEl.src = generateInitialAvatar("G");
  }
});

// Create a simple initial-letter avatar (image via canvas)
function generateInitialAvatar(letter) {
  const canvas = document.createElement("canvas");
  canvas.width = 200;
  canvas.height = 200;

  const ctx = canvas.getContext("2d");
  // background
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, 200, 200);

  // letter
  ctx.fillStyle = "#a5b4fc";
  ctx.font = "bold 110px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, 100, 120);

  return canvas.toDataURL();
}


  // --- PARAGRAPHS DATA ---
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
      "Listen to the birds sing songs in the morning light.",
      "The red car drove down the long winding road slowly.",
      "Open the window to let the fresh air come inside.",
      "Drink plenty of water to stay hydrated during the day.",
      "Small steps taken every day lead to great distance.",
      "Write down your goals to help you reach them faster.",
      "The cat slept on the soft mat by the warm fire.",
      "Smile at the world and the world will smile back.",
      "Use your time wisely to get your work done early.",
      "Learn from your mistakes and try again with a smile.",
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
      "Learning a new language opens doors to different cultures and people.",
      "Remember to save your documents frequently to avoid losing data.",
      "Balance is the key to maintaining a healthy and happy lifestyle.",
      "The library is a quiet place filled with endless hidden knowledge.",
      "Running is a great exercise, but swimming is easier on the joints.",
      "Science fiction often predicts future technologies with scary accuracy.",
      "Planning your week ahead can reduce stress and increase productivity.",
      "The sunset painted the horizon in shades of purple and gold.",
      "Usually, the simplest solution is the best one for the problem.",
      "History often repeats itself for those who do not learn from it.",
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
      "Debugging is like being the detective in a crime movie where you are the murderer.",
      "To be, or not to be: that is the question: Whether 'tis nobler in the mind.",
      "The mitochondria is the powerhouse of the cell, generating ATP energy.",
      "Quantum entanglement suggests particles remain connected over vast distances.",
      "Approximately 70% of the earth is covered by water, yet water scarcity exists.",
      "CamelCase and snake_case are two common naming conventions in programming.",
      "The psychological phenomenon known as 'Deja Vu' feels strangely familiar.",
      "Photosynthesis: the process by which green plants and some organisms use sunlight.",
      "If x = 5 and y = 10, then the value of 2x + 3y must equal 40.",
      "High-speed internet access has transformed global commerce and education.",
      "Cryptocurrency relies on blockchain technology to maintain a decentralized ledger.",
      "A quixotic endeavor is one that is hopeful but unlikely to succeed.",
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
      "function main() { return process.env.PORT || 3000; } // Default port configuration.",
      "The price appeared as $1,299.99—a 25% markup from the original MSRP!",
      "Amazingly, few discotheques provide jukeboxes; quiet music is rare.",
      "SELECT * FROM users WHERE username = 'admin' AND status != 'banned';",
      "Please send the package to 1234 W. 42nd St., Apt #5B, New York, NY 10036.",
      "Jinxed wizards pluck ivy from the quilted thorax of a huge, buzzing bee.",
      "Symbiosis (mutualism, commensalism, parasitism) describes biological interactions.",
      "Error 404: The requested resource /index.html was not found on this server.",
      "My password is extremely_secure_123! but I still use 2FA for safety.",
      "Cozy lummox gives smart squid who asks for job pen.",
    ],
  };

  let difficulty = localStorage.getItem("bt_difficulty") || "medium";
  let history = JSON.parse(localStorage.getItem("bt_history") || "[]");
  let timeLimit = 60;
  let remaining = timeLimit;
  let currentUser = null;

  // --- BLIND VARS ---
  let timerId = null;
  let testRunning = false;
  let testStartTime = null;
  let lastStats = { wpm: 0, accuracy: 0, characters: 0 };
  let currentParagraph = "";
  let charSpans = [];

  // --- NORMAL VARS ---
  let normalRunning = false;
  let normalTimer = null;
  let normalStartTime = null;
  let normalStats = { wpm: 0, accuracy: 0, characters: 0 };

  // ============================================
  //  HELPER FUNCTIONS
  // ============================================

  function chooseRandomParagraphText() {
    const levelList = paragraphs[difficulty] || paragraphs.medium;
    return levelList[Math.floor(Math.random() * levelList.length)];
  }

  // Render Blind Mode (Spans)
  function renderParagraph(text) {
    if (!typingTextEl) return;
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

  // Render Normal Mode (Spans for highlighting)
  function renderNormalParagraph(text) {
    if (!typingTextNormalEl) return;
    typingTextNormalEl.innerHTML = "";
    text.split("").forEach((ch) => {
      const span = document.createElement("span");
      span.textContent = ch;
      span.classList.add("char");
      typingTextNormalEl.appendChild(span);
    });
  }

  function saveHistoryLocal(entry) {
    history.push(entry);
    if (history.length > 10) history = history.slice(-10);
    localStorage.setItem("bt_history", JSON.stringify(history));
  }

  function recomputeDifficulty() {
    if (history.length === 0) {
      difficulty = "medium";
    } else {
      const last = history[history.length - 1];
      const recent = history.slice(-3);
      const fastCount = recent.filter((h) => h.wpm >= 50 && h.accuracy >= 85).length;

      if (last.accuracy < 80) difficulty = "easy";
      else if (fastCount === 3) difficulty = "challenge";
      else if (last.wpm >= 40 && last.accuracy >= 82) difficulty = "hard";
      else difficulty = "medium";
    }
    localStorage.setItem("bt_difficulty", difficulty);
  }

  // ============================================
  //  UI UPDATES
  // ============================================

  function resetStatsUI() {
    // Blind Mode Stats
    if (wpmEl) wpmEl.textContent = "0";
    if (accuracyEl) accuracyEl.textContent = "0%";
    if (charactersEl) charactersEl.textContent = "0";

    // Normal Mode Stats (The ones you fixed in HTML)
    if (wpmNormalEl) wpmNormalEl.textContent = "0";
    if (accuracyNormalEl) accuracyNormalEl.textContent = "0%";
    if (charactersNormalEl) charactersNormalEl.textContent = "0";

    remaining = timeLimit;
    if (timeLeftEl) timeLeftEl.textContent = remaining;
    if (timeLeftNormalEl) timeLeftNormalEl.textContent = remaining;
    
    // Clear highlights
    updateHighlight(""); 
    if(normalInput) updateNormalHighlight();
  }

  function setTimeLimitFromButtons() {
    const btn60 = document.getElementById("btn-60");
    const btn120 = document.getElementById("btn-120");
    const customBtn = document.getElementById("custom-time");

    function setActiveButton(active) {
      [btn60, btn120, customBtn].forEach((btn) => {
        if (!btn) return;
        btn.classList.toggle("chip-primary", btn === active);
        btn.classList.toggle("chip-soft", btn !== active);
      });
    }

    if (btn60) {
      btn60.addEventListener("click", () => {
        timeLimit = 60;
        resetStatsUI();
        setActiveButton(btn60);
      });
    }
    if (btn120) {
      btn120.addEventListener("click", () => {
        timeLimit = 120;
        resetStatsUI();
        setActiveButton(btn120);
      });
    }
    if (customBtn) {
      customBtn.addEventListener("click", () => {
        const val = prompt("Seconds (10-600):", "60");
        if (val && !isNaN(val) && val >= 10 && val <= 600) {
          timeLimit = parseInt(val);
          resetStatsUI();
          setActiveButton(customBtn);
        }
      });
    }
    // Set initial display
    if (timeLeftEl) timeLeftEl.textContent = timeLimit;
    if (timeLeftNormalEl) timeLeftNormalEl.textContent = timeLimit;
  }

  // ============================================
  //  BLIND MODE LOGIC
  // ============================================

  function updateHighlight(typed) {
    if (!charSpans.length) return;
    charSpans.forEach((span, i) => {
      span.classList.toggle("current", i === typed.length);
    });
  }

  function computeStats() {
    const target = currentParagraph;
    const typed = hiddenInput.value;
    const charsTyped = typed.length;
    charactersEl.textContent = charsTyped;

    updateHighlight(typed);

    if (!testStartTime || charsTyped === 0) return;

    let correct = 0;
    for (let i = 0; i < Math.min(charsTyped, target.length); i++) {
      if (typed[i] === target[i]) correct++;
    }

    const accuracy = charsTyped ? (correct / charsTyped) * 100 : 0;
    const words = typed.trim().length ? typed.trim().split(/\s+/).length : 0;
    const elapsed = (Date.now() - testStartTime) / 60000;
    const wpm = Math.round(words / (elapsed || 0.001));

    wpmEl.textContent = wpm;
    accuracyEl.textContent = `${accuracy.toFixed(0)}%`;
    lastStats = { wpm, accuracy, characters: charsTyped };
  }

  function startTest() {
    if (testRunning) return;
    testRunning = true;
    hiddenInput.value = "";
    hiddenInput.focus();
    resetStatsUI();
    
    testStartTime = Date.now();
    timerId = setInterval(() => {
      remaining--;
      if (timeLeftEl) timeLeftEl.textContent = remaining;
      if (remaining <= 0) endTest();
    }, 1000);
  }

  async function endTest() {
    testRunning = false;
    clearInterval(timerId);
    computeStats();
    await saveTestToBackend({ ...lastStats, difficulty, timeLimit, mode: "blind" });
    recomputeDifficulty();
  }

  // ============================================
  //  NORMAL MODE LOGIC (Fixed for your HTML)
  // ============================================

  function updateNormalHighlight() {
    if (!typingTextNormalEl) return;
    const chars = typingTextNormalEl.querySelectorAll("span");
    const typed = normalInput ? normalInput.value.split("") : [];

    chars.forEach((span, i) => {
      if (typed[i] == null) {
        span.style.color = ""; // reset
      } else if (typed[i] === span.textContent) {
        span.style.color = "#22c55e"; // green
      } else {
        span.style.color = "#ef4444"; // red
      }
    });
  }

  function computeNormalStats() {
    const target = typingTextNormalEl.textContent;
    const typed = normalInput.value;
    const charsTyped = typed.length;

    // Highlight text
    updateNormalHighlight();

    // 1. UPDATE CHARACTERS (Targeting your new ID)
    if (charactersNormalEl) charactersNormalEl.textContent = charsTyped;

    let correct = 0;
    for (let i = 0; i < Math.min(charsTyped, target.length); i++) {
      if (typed[i] === target[i]) correct++;
    }

    const accuracy = charsTyped ? (correct / charsTyped) * 100 : 0;
    const words = typed.trim().length ? typed.trim().split(/\s+/).length : 0;
    const elapsed = (Date.now() - normalStartTime) / 60000;
    const wpm = Math.round(words / (elapsed || 0.001));

    // 2. UPDATE WPM & ACCURACY (Targeting your new IDs)
    if (wpmNormalEl) wpmNormalEl.textContent = wpm;
    if (accuracyNormalEl) accuracyNormalEl.textContent = accuracy.toFixed(0) + "%";

    normalStats = { wpm, accuracy, characters: charsTyped };
  }

  function startNormalTest() {
    if (normalRunning) return;
    normalRunning = true;
    
    // Ensure text is rendered correctly with spans
    if (typingTextNormalEl.querySelectorAll('span').length === 0) {
      renderNormalParagraph(chooseRandomParagraphText());
    }

    if (normalInput) {
      normalInput.value = "";
      normalInput.focus();
    }
    
    resetStatsUI();
    normalStartTime = Date.now();

    normalTimer = setInterval(() => {
      remaining--;
      if (timeLeftNormalEl) timeLeftNormalEl.textContent = remaining;
      if (remaining <= 0) stopNormalTest();
    }, 1000);
  }

  async function stopNormalTest() {
    normalRunning = false;
    clearInterval(normalTimer);
    computeNormalStats();
    await saveTestToBackend({ ...normalStats, difficulty, timeLimit, mode: "normal" });
    recomputeDifficulty();
  }

  // ============================================
  //  BACKEND & EVENTS
  // ============================================

  async function saveTestToBackend(entry) {
    if (!currentUser) return;
    try {
      // Save specific test
      await addDoc(collection(db, "users", currentUser.uid, "tests"), {
        ...entry,
        createdAt: serverTimestamp(),
      });

      // Update Aggregates
      const statsRef = doc(db, "users", currentUser.uid);
      const snap = await getDoc(statsRef);
      let data = snap.exists() ? snap.data() : { bestWpm: 0, avgAccuracy: 0, totalTests: 0 };
      
      const newTotal = (data.totalTests || 0) + 1;
      const newBest = Math.max(data.bestWpm || 0, entry.wpm);
      const newAvg = ((data.avgAccuracy || 0) * (data.totalTests || 0) + entry.accuracy) / newTotal;

      await setDoc(statsRef, {
        bestWpm: newBest,
        avgAccuracy: newAvg,
        totalTests: newTotal
      }, { merge: true });

      updateHeroMetrics(newBest, newAvg, newTotal);
    } catch (e) {
      console.error("Save error:", e);
    }
  }

  function updateHeroMetrics(best, avg, total) {
    if (bestScoreEl) bestScoreEl.textContent = `${best} WPM`;
    if (avgAccuracyPill) avgAccuracyPill.textContent = `${avg.toFixed(0)}%`;
    if (totalTestsPill) totalTestsPill.textContent = `${total} completed`;
  }

  // --- INIT LISTENERS ---
  
  // 1. Buttons
  if (startBtn) startBtn.addEventListener("click", startTest);
  if (resetBtn) resetBtn.addEventListener("click", () => {
    testRunning = false;
    clearInterval(timerId);
    hiddenInput.value = "";
    resetStatsUI();
  });

  if (startBtnNormal) startBtnNormal.addEventListener("click", startNormalTest);
  if (resetBtnNormal) resetBtnNormal.addEventListener("click", () => {
    normalRunning = false;
    clearInterval(normalTimer);
    if (normalInput) normalInput.value = "";
    renderNormalParagraph(chooseRandomParagraphText());
    resetStatsUI();
  });

  if (changeTextBtn) changeTextBtn.addEventListener("click", () => {
     renderParagraph(chooseRandomParagraphText());
     resetStatsUI();
  });
  
  if (changeTextNormalBtn) changeTextNormalBtn.addEventListener("click", () => {
     renderNormalParagraph(chooseRandomParagraphText());
     if(normalInput) normalInput.value = "";
     resetStatsUI();
  });

  // 2. Typing Input
  hiddenInput.addEventListener("input", () => {
    if (testRunning) computeStats();
  });

  if (normalInput) {
    normalInput.addEventListener("input", () => {
      if (normalRunning) computeNormalStats();
    });
  }

  // 3. Keyboard Focus (Blind Mode)
  window.addEventListener("keydown", (e) => {
    const isMeta = e.ctrlKey || e.metaKey || e.altKey;
    // Only focus hidden input if Blind test is running AND user isn't typing in Normal box
    if (testRunning && !isMeta && document.activeElement !== normalInput) {
      hiddenInput.focus();
    }
  });

  // 4. Mode Switch Cleanup
  document.querySelectorAll(".mode-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      // Stop everything when switching tabs
      testRunning = false;
      normalRunning = false;
      clearInterval(timerId);
      clearInterval(normalTimer);
      resetStatsUI();
    });
  });

  // 5. Auth
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "index.html";
      return;
    }
    currentUser = user;
    // Load initial stats
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      const d = snap.data();
      updateHeroMetrics(d.bestWpm || 0, d.avgAccuracy || 0, d.totalTests || 0);
    }
  });

  // 6. Mobile Scroll
  document.querySelectorAll("textarea").forEach(el => {
    el.addEventListener("focus", () => {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
    });
  });

  // 7. Initial Render
  renderParagraph(chooseRandomParagraphText());
  renderNormalParagraph(chooseRandomParagraphText());
  setTimeLimitFromButtons();
  resetStatsUI();

  
});


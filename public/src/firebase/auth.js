import {
  initializeApp,
  getApps,
  getApp,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";

import {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA98nAIBFY661DgyYsSRefqhZD8lyDtOL0",
  authDomain: "kitty-type.firebaseapp.com",
  projectId: "kitty-type",
  storageBucket: "kitty-type.firebasestorage.app",
  messagingSenderId: "612284520712",
  appId: "1:612284520712:web:992d87ad71131d03a0f4bd",
};

// ✅ Safe init (won’t crash if Firebase is already initialized somewhere else)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// DOM elements
const loginForm = document.getElementById("login-form");
const googleBtn = document.getElementById("google-login");
const rememberCheckbox = document.getElementById("rememberMe"); // ✅ matches HTML id
const forgotLink = document.getElementById("forgot-password");

// where to go after login
const redirectAfterLogin = () => (window.location.href = "typing.html");

// ✅ Decide persistence based on Remember Me
const getPersistence = () =>
  rememberCheckbox && rememberCheckbox.checked
    ? browserLocalPersistence        // stays logged in even after closing browser
    : browserSessionPersistence;     // logs out when browser closes

const showError = (e) => {
  console.error("Auth error:", e.code, e.message, e);
  alert(e.message || "Something went wrong. Please try again.");
};

// ✅ Save or clear email in localStorage based on Remember Me
function handleRememberEmail(email) {
  if (!rememberCheckbox) return;
  if (rememberCheckbox.checked && email) {
    localStorage.setItem("savedEmail", email);
  } else {
    localStorage.removeItem("savedEmail");
  }
}

// ✅ Restore email + checkbox on page load
window.addEventListener("load", () => {
  const savedEmail = localStorage.getItem("savedEmail");
  if (!savedEmail) return;

  const emailInput = document.getElementById("email");
  if (emailInput) {
    emailInput.value = savedEmail;
  }
  if (rememberCheckbox) {
    rememberCheckbox.checked = true;
  }
});

// ---------- EMAIL + PASSWORD LOGIN ----------
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      await setPersistence(auth, getPersistence());
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log("Email login success:", cred.user.uid);

      handleRememberEmail(email); // ✅ store/clear email based on checkbox
      redirectAfterLogin();
    } catch (e) {
      showError(e);
    }
  });
} else {
  console.warn("login-form not found in DOM");
}

// ---------- GOOGLE LOGIN ----------
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    try {
      await setPersistence(auth, getPersistence());
      const result = await signInWithPopup(auth, provider);
      console.log("Google login success:", result.user.uid);

      handleRememberEmail(result.user?.email || ""); // ✅ works with Remember Me too
      redirectAfterLogin();
    } catch (e) {
      showError(e);
    }
  });
} else {
  console.warn("google-login button not found in DOM");
}

// ---------- RESET PASSWORD ----------
if (forgotLink) {
  forgotLink.addEventListener("click", async (e) => {
    e.preventDefault();

    let email = document.getElementById("email")?.value.trim();

    // if email box empty, ask user
    if (!email) {
      email = prompt("Enter your email to receive a reset link:");
    }
    if (!email) return; // user cancelled

    try {
      await sendPasswordResetEmail(auth, email);
      alert(`Password reset link sent to ${email}. Check your inbox.`);
    } catch (err) {
      showError(err);
    }
  });
} else {
  console.warn("forgot-password link not found in DOM");
}

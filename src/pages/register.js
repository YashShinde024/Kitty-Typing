import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA98nAIBFY661DgyYsSRefqhZD8lyDtOL0",
  authDomain: "kitty-type.firebaseapp.com",
  projectId: "kitty-type",
  storageBucket: "kitty-type.firebasestorage.app",
  messagingSenderId: "612284520712",
  appId: "1:612284520712:web:992d87ad71131d03a0f4bd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.addEventListener("DOMContentLoaded", () => {
  console.log("Register script loaded");

  const form = document.getElementById("register-form");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const termsCheckbox = document.getElementById("terms");

  if (!form) {
    console.error("⚠️ No form with id='register-form' found in HTML");
    return;
  }

  if (!termsCheckbox) {
    console.warn("⚠️ No checkbox with id='terms' found. Terms check will be skipped.");
  }

  function redirectAfterRegister() {
    // If index.html is your LOGIN page, this is correct.
    // If typing.html is your main page, change this to "typing.html".
    window.location.href = "index.html";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Submit clicked");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (termsCheckbox && !termsCheckbox.checked) {
      alert("Please accept Terms & Policy");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created:", userCredential.user.uid);

      if (name) {
        await updateProfile(userCredential.user, { displayName: name });
      }

      alert("Registration successful!");
      redirectAfterRegister();

    } catch (err) {
      console.error("Register error:", err.code, err.message, err);
      alert(err.message || "Registration failed");
    }
  });
});

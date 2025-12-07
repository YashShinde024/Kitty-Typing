# 🐱 Kitty Typing – Blind Typing Speed Test

A modern, UI-rich typing test web application that helps users improve their typing accuracy and speed using **blind typing**, AI-based adaptive difficulty, and real-time statistics.  
Users can register/login using **Email or Google Auth**, and track their best WPM, accuracy & test history, stored securely in **Firestore Database**.


## 🚀 Features

### 🔥 Typing Test
- Blind typing mode (input hidden)
- Real-time **WPM, Accuracy & Characters** tracking
- Difficulty auto-adapts based on performance *(Easy → Medium → Hard → Challenge)*
- Custom test duration (60s / 120s / user-defined)
- Change text instantly while practicing

### 🔐 Authentication (Firebase v11)
- Email & Password login
- Google Sign-In
- Session persistence with **Remember Me**
- Password reset support
- Protected routes → typing page requires login

### 📊 User Stats (Stored in Firestore)
- Best WPM saved & displayed
- Average accuracy tracking
- Total tests completed count
- Data stored per-user securely


## 📁 Project Structure

Kitty-Typing/
│── assets/
│ └── images/logo.jpg
│
│── public/
│ ├── index.html
│ ├── registration.html
│ ├── typing.html
│ └── styles/style.css
│
│── src/
│ ├── firebase/auth.js
│ └── pages/
│ ├── main.js ← Typing logic, Firestore saving, difficulty handling
│ └── register.js
│
└── README.md
## 🛠 Tech Stack

| Area | Technology |
|-----|------------|
| Frontend | HTML, CSS, JavaScript |
| Backend/Auth | Firebase Authentication |
| Database | Firestore |
| Hosting | GitHub Pages / Netlify / Vercel |
| Version Control | Git & GitHub |

---
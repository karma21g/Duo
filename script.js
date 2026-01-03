import { QUESTIONS } from "./questions.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* 🔥 CONFIG FIREBASE */
const firebaseConfig = {
  apiKey: "AIzaSyCtFyop8bPMLgW0S2YcOJtCHK...",
  authDomain: "almi-6115d.firebaseapp.com",
  databaseURL: "https://almi-6115d-default-rtdb.firebaseio.com",
  projectId: "almi-6115d",
  storageBucket: "almi-6115d.appspot.com",
  messagingSenderId: "1034788522244",
  appId: "1:1034788522244:web:7a9bba2563..."
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let gameId = null;
let player = null;
let currentQuestion = 0;
let selectedQuestions = [];

/* 🎲 OUTILS */
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

/* 🎮 CRÉER PARTIE */
window.createGame = async () => {
  player = document.getElementById("pseudo").value;
  if (!player) return alert("Entre un pseudo");

  gameId = Math.random().toString(36).substring(2, 7).toUpperCase();
  selectedQuestions = shuffle([...QUESTIONS]).slice(0, 20);

  await set(ref(db, "games/" + gameId), {
    questions: selectedQuestions,
    players: { A: player }
  });

  alert("Code de partie : " + gameId);
  waitForPlayer();
};

/* 🔗 REJOINDRE */
window.joinGame = async () => {
  player = document.getElementById("pseudo").value;
  gameId = document.getElementById("code").value;

  if (!player || !gameId) return;

  await set(ref(db, "games/" + gameId + "/players/B"), player);
  startGame();
};

/* ⏳ ATTENTE */
function waitForPlayer() {
  onValue(ref(db, "games/" + gameId + "/players"), snap => {
    if (snap.exists() && snap.val().B) startGame();
  });
}

/* ▶️ JEU */
function startGame() {
  document.getElementById("login").style.display = "none";
  document.getElementById("game").style.display = "block";
  showQuestion();
}

function showQuestion() {
  const q = selectedQuestions[currentQuestion];
  document.getElementById("question").innerText = q.text;

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  q.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.innerText = choice;
    btn.className = "choice";
    btn.onclick = () => nextQuestion();
    choicesDiv.appendChild(btn);
  });
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < selectedQuestions.length) {
    showQuestion();
  } else {
    document.getElementById("game").innerHTML = "<h2>Fin de la partie 🎉</h2>";
  }
}
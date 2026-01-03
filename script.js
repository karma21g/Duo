// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "TA_API_KEY",
  authDomain: "TON_PROJET.firebaseapp.com",
  databaseURL: "https://TON_PROJET-default-rtdb.firebaseio.com",
  projectId: "TON_PROJET",
  appId: "TON_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 🧠 Variables globales
let gameCode = null;
let player = null;
let currentQuestion = 0;
let realAnswer = null;

// ❓ Questions
const questions = [
  {
    text: "Tu préfères ?",
    choices: ["Netflix", "Sortir", "Dormir"]
  },
  {
    text: "Le week-end idéal ?",
    choices: ["Plage", "Maison", "Voyage"]
  }
];

// 🔢 Générer code
function generateCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// 🧑‍🚀 Créer partie
function createGame() {
  const pseudo = document.getElementById("pseudo").value;
  if (!pseudo) return alert("Entre un pseudo");

  gameCode = generateCode();
  player = "p1";

  db.ref("games/" + gameCode).set({
    status: "waiting",
    players: {
      p1: pseudo
    }
  });

  localStorage.setItem("gameCode", gameCode);
  localStorage.setItem("player", player);

  document.getElementById("login").style.display = "none";
  document.getElementById("waiting").style.display = "block";
  document.getElementById("gameCode").innerText = gameCode;

  waitForPlayer();
}

// 🤝 Rejoindre partie
function joinGame() {
  const pseudo = document.getElementById("pseudo").value;
  const code = document.getElementById("codeInput").value;
  if (!pseudo || !code) return alert("Champs manquants");

  gameCode = code;
  player = "p2";

  const ref = db.ref("games/" + gameCode);

  ref.once("value", snap => {
    if (!snap.exists()) return alert("Partie inexistante");

    ref.child("players/p2").set(pseudo);
    ref.child("status").set("playing");

    localStorage.setItem("gameCode", gameCode);
    localStorage.setItem("player", player);

    startGame();
  });
}

// ⏳ Attente joueur 2
function waitForPlayer() {
  db.ref("games/" + gameCode + "/status").on("value", snap => {
    if (snap.val() === "playing") {
      startGame();
    }
  });
}

// ▶️ Lancer le jeu
function startGame() {
  document.getElementById("waiting").style.display = "none";
  document.getElementById("game").style.display = "block";
  loadQuestion();
}

// ❓ Charger question
function loadQuestion() {
  const q = questions[currentQuestion];
  document.getElementById("question").innerText = q.text;

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  q.choices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.innerText = choice;
    btn.className = "choice";

    btn.onclick = () => selectReal(index);
    choicesDiv.appendChild(btn);
  });
}

// ✅ Réponse réelle
function selectReal(index) {
  realAnswer = index;
  alert("Maintenant choisis ce que tu penses que l’autre a choisi");

  document.querySelectorAll(".choice").forEach((btn, i) => {
    btn.onclick = () => selectGuess(i);
  });
}

// 🤔 Supposition
function selectGuess(index) {
  const path = `games/${gameCode}/answers/q${currentQuestion}/${player}`;
  db.ref(path).set({
    real: realAnswer,
    guess: index
  });

  currentQuestion++;
  if (currentQuestion < questions.length) {
    loadQuestion();
  } else {
    alert("Partie terminée 🎉");
  }
                    }

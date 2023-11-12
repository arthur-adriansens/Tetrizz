/** @format */

// global variables
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const cols = 10;
const rows = 16;
const colors = ["LightSkyBlue", "DeepSkyBlue", "LightSalmon", "Gold", "DarkSeaGreen", "Plum", "Tomato"];
const scoresHTML = document.querySelector("#personalScores");
const usernameHTML = document.querySelector("#username");
const startHTML = document.querySelector("#start");

const soundtrack = new Audio("./assets/music/Tetris Soundtrack.mp3");
const clearSound = new Audio("./assets/music/clear.mp3");
const endSound = new Audio("./assets/music/success.wav");
const rotateSound = new Audio("./assets/music/rotate.mp3");
const dropSound = new Audio("./assets/music/drop.mp3");
const soundOptions = [soundtrack, endSound, clearSound, rotateSound, dropSound];
const totalVolume = () => document.querySelector("#volume").dataset.state * 0.5;

let board, game, piece, color, block_size;
let username = window.localStorage.getItem("username");
let startScreen = false;

// event listeners
window.onload = () => {
    soundtrack.loop = true;
    soundtrack.volume = totalVolume() * 0.5;

    change_dimensions();
    usernameHTML.value = username ? username : "";
};

startHTML.onclick = () => {
    game = new Game();

    startHTML.style.opacity = "0";
    startHTML.disabled = true;
    piece = new Piece();

    soundtrack.currentTime = 0;
    soundtrack.play();
};

window.onresize = () => {
    change_dimensions(true);
};

usernameHTML.oninput = () => {
    username = usernameHTML.value;
    window.localStorage.setItem("username", username);
};

document.querySelector("#reset").onclick = () => {
    local_scores(true);
};

document.querySelector(".options").onclick = (e) => {
    if (e.target.classList.contains("options")) return;
    toggleIcon(e);
};

// functions
// canvas
function change_dimensions(redraw = false) {
    canvas.height = (document.querySelector("#game").clientHeight - 4) * 0.95;
    block_size = canvas.height / rows;
    canvas.width = block_size * cols;

    if (redraw) game.redraw();
}

// icons
function toggleIcon(click) {
    let icon = click.target;
    let old_state = Number(icon.dataset.state);

    icon.dataset.state = old_state == icon.dataset.max ? 0 : old_state + 1;
    icon.src = icon.src.replace(`${old_state}.svg`, `${icon.dataset.state}.svg`);
    iconChangeVolume(icon.id != "volume" ? icon : 0);
}

function iconChangeVolume(icon) {
    let changes = Array.from(soundOptions);
    let effectsLevel = document.querySelector("#effects").dataset.state;
    let trackLevel = document.querySelector("#track").dataset.state;

    icon.src?.includes("effects") ? changes.splice(0, 2) : 0;
    icon.src?.includes("music") ? changes.splice(2) : 0;

    for (let change of changes) {
        let newVolume = soundOptions.indexOf(change) > 1 ? effectsLevel : trackLevel * 0.5;
        change.volume = newVolume * totalVolume();
    }
}

// scores
const local_scores = (clear = false) => {
    if (clear) {
        scoresHTML.innerHTML = "<li style='list-style: none;'><i>It seems like you haven't played yet!</i></li>";
        window.localStorage.clear();
        return;
    }

    let scores = window.localStorage.getItem("scores");
    if (!scores) return []; // if 0 or undefined

    let sortedScores = scores
        .split(",")
        .slice()
        .sort((a, b) => b - a);

    if (sortedScores.length >= 10) {
        sortedScores.splice(10);
    }

    window.localStorage.setItem("scores", sortedScores);

    scoresHTML.innerHTML = "";
    for (let score of sortedScores) {
        scoresHTML.innerHTML += `<li>${score}</li>`;
    }

    return sortedScores;
};

function new_score(newScore, final = false) {
    document.querySelector("#score").innerHTML = newScore;
    if (!final || !newScore) return;

    document.querySelector("#finalScore").innerHTML = newScore;

    let scores = local_scores();
    scores.push(newScore);
    window.localStorage.setItem("scores", scores);

    local_scores();
}

function upload_highscore(score) {
    if (score == 0 || !username) return;

    const url = "https://sjh-tetris.glitch.me/newScore";
    const data = { user: username, score: score };

    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((data) => console.log("Response data:", data))
        .catch((error) => console.error("Error:", error));
}

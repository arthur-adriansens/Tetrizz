/** @format */

// setup
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const cols = 10;
const rows = 15;
const colors = ["LightSkyBlue", "DeepSkyBlue", "LightSalmon", "Gold", "DarkSeaGreen", "Plum", "Tomato"];
const scoresHTML = document.querySelector("#personalScores");
const usernameHTML = document.querySelector("#username");

const startButton = document.querySelector("#start");
const soundtrack = new Audio("./assets/Tetris Soundtrack.mp3");
soundtrack.loop = true;
const endSound = new Audio("./assets/success.wav");

let board, game, piece, color, block_size;
let username = window.localStorage.getItem("username");
let startScreen = false;

ctx.strokeStyle = "gray";
ctx.lineWidth = 1;

// event listeners
window.onload = () => {
    change_dimensions();
    usernameHTML.value = username ? username : "";
    game = new Game();
};

startButton.onclick = () => {
    startButton.style.opacity = "0";
    startButton.disabled = true;
    piece = new Piece();

    soundtrack.currentTime = 0;
    soundtrack.play();
};

window.addEventListener("resize", () => change_dimensions(true));

usernameHTML.addEventListener("input", () => {
    username = usernameHTML.value;
    window.localStorage.setItem("username", username);
});

class Game {
    constructor() {
        this.score = 0;
        this.stop = false;

        board = this.redraw(true);
        local_scores();
    }

    redraw(setup = false) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draw grid
        ctx.strokeStyle = "gray";
        ctx.lineWidth = 1;

        ctx.beginPath(false);

        for (let i = 1; i < rows; i++) {
            ctx.moveTo(block_size * i, 0);
            ctx.lineTo(block_size * i, canvas.height);

            ctx.moveTo(0, block_size * i);
            ctx.lineTo(canvas.height, block_size * i);
        }

        ctx.stroke();

        if (setup) {
            // return 2d matrix
            return Array.from({ length: rows }, () => Array(cols).fill(0));
        }

        // redraw blocks
        board.forEach((row, rowIndex) => {
            row.forEach((x, colIndex) => {
                if (x != 0) {
                    ctx.fillStyle = colors[x - 3];
                    this.drawBlock(rowIndex, colIndex, x);
                }
            });
        });
    }

    drawBlock(col, row, value) {
        if (value == 0) return;
        ctx.fillRect(row * block_size + 1, col * block_size + 1, block_size - 2, block_size - 2);
    }

    isClipping(moveRow = 0, moveCol = 0, shape, width) {
        if (!shape) shape = piece.shape;
        if (!width) width = piece.width;

        for (let i in shape) {
            let col = (i % width) + Math.floor(cols / 2) - 2 + piece.extraX;
            let row = Math.floor(i / width) + piece.extraY;

            //if out of the board
            if (shape[i] != 0 && board[row][col] == undefined) return true;

            //if on top of other block
            if (board[row][col] == 0 || board[row][col] >= 3) continue;
            if (board[row + moveRow][col + moveCol] >= 3) return true;
        }

        return false;
    }

    validMove(move) {
        // check if on bottom row
        if (board[rows - 1].includes(1) && move == "y;1") {
            piece.disable();
            piece = !this.stop ? new Piece() : 0;
            return false;
        }

        // check right
        if (move == "x;1") {
            let rigthRow = board.map((row) => row[cols - 1]);
            if (rigthRow.includes(1) || this.isClipping(0, 1)) return false;
        }

        // check left
        if (move == "x;-1") {
            let leftRow = board.map((row) => row[0]);
            if (leftRow.includes(1) || this.isClipping(0, -1)) return false;
        }

        // underneath
        if (move == "y;1") {
            for (let i in piece.shape) {
                let col = (i % piece.width) + Math.floor(cols / 2) - 2 + piece.extraX;
                let row = Math.floor(i / piece.width) + piece.extraY;

                if (board[row][col] == 0 || board[row][col] >= 3) continue;

                if (board[row + 1][col] >= 3) {
                    piece.disable();
                    if (!this.stop) piece = new Piece();
                    return false;
                }
            }
        }

        return true;
    }

    checkRows() {
        let redraw = false;

        board.map((row, i) => {
            if (!row.includes(0) && !row.includes(1) && !row.includes(2)) {
                redraw = true;
                this.score += 100;
                new_score(this.score);

                // lower everything (remove row & put new row on top)
                board.splice(i, 1);
                board.splice(0, 0, new Array(cols).fill(0));
            }
        });

        if (redraw) this.redraw();
    }

    end() {
        this.stop = true;
        new_score(this.score, true);
        document.querySelector("#game").classList.toggle("over");

        console.log("game over");

        // sound
        soundtrack.pause();
        soundtrack.currentTime = 0;
        endSound.play();

        // reset button
        startButton.disabled = false;
        startButton.style.opacity = "1";
        // game = undefined;

        // sent new highscore to server
        if (this.score == 0 || !username) return;

        const url = "https://sjh-tetris.glitch.me/newScore";
        const data = { user: username, score: this.score };

        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => console.log("Response data:", data))
            .catch((error) => console.error("Error:", error));
    }
}

// html canvas
function change_dimensions(redraw = false) {
    canvas.height = (document.querySelector("#game").clientHeight - 4) * 0.95;
    block_size = canvas.height / rows;
    canvas.width = block_size * cols;

    if (redraw) game.redraw();
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
    if (!newScore) return;

    document.querySelector("#score").innerHTML = newScore;
    if (!final) return;

    document.querySelector("#finalScore").innerHTML = newScore;

    let scores = local_scores();
    scores.push(newScore);
    window.localStorage.setItem("scores", scores);

    local_scores();
}

/** @format */

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const cols = 10;
const rows = 15;
const colors = ["LightSkyBlue", "DeepSkyBlue", "LightSalmon", "Gold", "DarkSeaGreen", "Plum", "Tomato"];
const scoresOL = document.querySelector("#personalScores");

let board,
    game,
    piece,
    color,
    block_size,
    showOptions = false;

canvas.height = (document.querySelector("#game").clientHeight - 4) * 0.95;
block_size = canvas.height / rows;
canvas.width = block_size * cols;

ctx.strokeStyle = "gray";
ctx.lineWidth = 1;

scoresOL.innerHTML = "<li style='list-style: none;'><i>It seems like you haven't played yet!</i></li>";

window.addEventListener("resize", () => dimentions(true));

window.onload = () => {
    loadScores();

    game = new Game();
    piece = new Piece();
};

class Game {
    constructor() {
        this.score = 0;
        this.stop = false;
        board = this.grid = this.emptyBoard(false);
    }

    emptyBoard(redraw = true) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

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

        if (!redraw) {
            this.empty = new Array(cols).fill(0);
            return Array.from({ length: rows }, () => Array(cols).fill(0));
        }

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
        if (value != 0) {
            ctx.fillRect(row * block_size + 1, col * block_size + 1, block_size - 2, block_size - 2);
        }
    }

    // Other methods...

    end() {
        this.stop = true;
        newScore(this.score, true);
        document.querySelector("#game").classList.toggle("over");

        console.log("game over");

        const username = document.querySelector("#username").value;
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
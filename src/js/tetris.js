/** @format */

// setup
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// global variables
let board, game, piece, color, block_size;

// dimentions
const cols = 10;
const rows = 15;
let showOptions = false;

function dimentions(redraw = false) {
    canvas.height = (document.querySelector("#game").clientHeight - 4) * 0.95;
    block_size = canvas.height / rows;
    canvas.width = block_size * cols;

    if (redraw) game.emptyBoard(true);
}

dimentions();

// styling
const colors = ["LightSkyBlue", "DeepSkyBlue", "LightSalmon", "Gold", "DarkSeaGreen", "Plum", "Tomato"];
ctx.strokeStyle = "gray";
ctx.lineWidth = 1;
let startScreen = false;

// local highscores
const scoresOL = document.querySelector("#personalScores");

function loadScores(clear = false) {
    if (clear) {
        scoresOL.innerHTML = "<li style='list-style: none;'><i>It seems like you haven't played yet!</i></li>";
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

    scoresOL.innerHTML = "";
    for (let score of sortedScores) {
        scoresOL.innerHTML += `<li>${score}</li>`;
    }

    return sortedScores;
}

function newScore(newScore, final = false) {
    if (!newScore) return;

    document.querySelector("#score").innerHTML = newScore;
    if (!final) return;

    document.querySelector("#finalScore").innerHTML = newScore;

    let scores = loadScores();
    scores.push(newScore);
    window.localStorage.setItem("scores", scores);
    loadScores();
}

window.addEventListener("resize", () => dimentions(true));

window.onload = () => {
    loadScores();

    game = new Game();
    piece = new Piece();
};

class Game {
    constructor() {
        // setup new board
        this.score = 0;
        this.stop = false;
        board = this.grid = this.emptyBoard(false);
    }

    emptyBoard(redraw = true) {
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

        // return 2d matrix
        if (!redraw) {
            this.empty = new Array(cols).fill(0);
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
        if (value != 0) {
            ctx.fillRect(row * block_size + 1, col * block_size + 1, block_size - 2, block_size - 2);
        }
    }

    isClipping(moveRow = 0, moveCol = 0, shape, width) {
        shape = shape ? shape : piece.shape;
        width = width ? width : piece.width;

        for (let i in shape) {
            let col = (i % width) + Math.floor(cols / 2) - 2 + piece.extraX;
            let row = Math.floor(i / width) + piece.extraY;

            if (shape[i] != 0 && board[row][col] == undefined) {
                return true;
            }

            if (board[row][col] == 0 || board[row][col] >= 3) continue;

            if (board[row + moveRow][col + moveCol] >= 3) {
                return true;
            }
        }

        return false;
    }

    validMove(move) {
        // check if on bottom row
        if (board[rows - 1].includes(1)) {
            piece.disable();
            piece = !this.stop ? new Piece() : 0;
            return false;
        }

        // check right
        if (move == "x;1") {
            let rigthRow = board.map((row) => row[cols - 1]);
            if (rigthRow.includes(1)) return false;

            if (this.isClipping(0, 1)) return false;
        }

        // check left
        if (move == "x;-1") {
            let leftRow = board.map((row) => row[0]);
            if (leftRow.includes(1)) return false;

            if (this.isClipping(0, -1)) return false;
        }

        // underneath
        if (move != "y;1") return true;

        for (let i in piece.shape) {
            let col = (i % piece.width) + Math.floor(cols / 2) - 2 + piece.extraX;
            let row = Math.floor(i / piece.width) + piece.extraY;

            if (board[row][col] == 0 || board[row][col] >= 3) continue;

            if (board[row + 1][col] >= 3) {
                piece.disable();
                piece = !this.stop ? new Piece() : 0;
                return false;
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
                newScore(this.score);

                // remove row & lower everything
                board.splice(i, 1);
                board.splice(0, 0, this.empty);
            }
        });

        if (redraw) this.emptyBoard();
    }

    end() {
        this.stop = true;
        newScore(this.score, true);
        document.querySelector("#game").classList.toggle("over");

        console.log("game over");

        // sent new highscore to server
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

class Piece {
    constructor() {
        this.shapes = {
            // allemaal width van 3
            I: [0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 1, 0],
            J: [0, 1, 0, 0, 2, 0, 1, 1, 0],
            L: [0, 1, 0, 0, 2, 0, 0, 1, 1],
            O: [0, 0, 0, 0, 2, 1, 0, 1, 1],
            S: [0, 0, 0, 0, 2, 1, 1, 1, 0],
            T: [0, 0, 0, 1, 2, 1, 0, 1, 0],
            Z: [0, 0, 0, 1, 2, 0, 0, 1, 1],
        };
        this.shapeTypes = Object.keys(this.shapes);
        this.width = 3;

        // x & y cordinates
        this.extraY = this.extraX = this.mostRight = 0;
        this.mostLeft = cols;
        this.placeBlock(true);

        // add key control
        document.addEventListener("keydown", this.keyPress);
        // this.lowerAutomaticaly();
    }

    disable(end = false) {
        clearInterval(this.interval);
        document.removeEventListener("keydown", this.keyPress);

        this.shape = this.shape.map((x) => {
            if (x != 0) {
                return 3 + this.piece; // + extra for color
            }

            return 0;
        });

        if (end) {
            game.end();
            return;
        }

        this.placeBlock();
        game.emptyBoard(true);
    }

    placeBlock(newBlock = false, clearTrail = false, shape = this.shape) {
        // shape
        // this.piece = newBlock ? Math.floor(Math.random() * this.shapeTypes.length) : this.piece;
        this.piece = 6;
        this.shape = newBlock ? this.shapes[this.shapeTypes[this.piece]] : shape;

        // color
        color = ctx.fillStyle = clearTrail ? "white" : colors[this.piece];

        // fill blocks
        for (let i in this.shape) {
            let col = (i % this.width) + Math.floor(cols / 2) - 2 + this.extraX;
            let row = Math.floor(i / this.width) + this.extraY;

            if (this.shape[i] != 0) {
                // check if taken
                if (newBlock && board[row][col] > 2) {
                    this.disable(true);
                    return;
                }

                // change matrix & visual board
                board[row][col] = clearTrail ? 0 : this.shape[i];
                game.drawBlock(row, col, this.shape[i]);
            }
        }

        // check for full rows
        game.checkRows();
    }

    rotate() {
        // todo things can still rotate through each other!

        // O shape
        if (this.piece == 3) return;

        // long I shape
        let oldShape = this.shape;

        if (this.piece == 0) {
            this.rotated = this.rotated ? !this.rotated : true;

            if (this.rotated) {
                if (game.isClipping(0, 0, [0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0], 4)) return;

                this.placeBlock(false, true);
                this.shape = [0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0];
                this.width = 4;
            } else {
                if (game.isClipping(0, 0, this.shapes[this.shapeTypes[this.piece]], 3)) return;

                this.placeBlock(false, true);
                this.shape = this.shapes[this.shapeTypes[this.piece]];
                this.width = 3;
            }

            this.placeBlock();
            return;
        }

        // convert to 2d shape (matrix)
        let matrix = Array.from({ length: Math.floor(this.shape.length / 3) }, (x, i) => this.shape.slice(i * 3, (i + 1) * 3));

        // turn counterclockwise, then reverse rows
        let transformed = matrix.map((col, colIndex) => matrix.map((row) => row[colIndex]));
        let newShape = transformed.map((row) => row.reverse()).flat();

        if (game.isClipping(0, 0, newShape)) return;
        this.placeBlock(false, true);
        this.shape = newShape;

        // redraw
        this.placeBlock();
    }

    drop() {
        let succes = this.move("y;1");

        while (succes) {
            succes = this.move("y;1");
        }
    }

    move(query) {
        //query = (x;-1), (x;1), (y;-1)
        let [axis, extra] = query.split(";");
        if (!axis || !extra) return false;

        if (!game.validMove(query)) return false;

        // clear trail
        this.placeBlock(false, true);

        // change x and y cords
        axis == "y" ? (this.extraY += Number(extra)) : (this.extraX += Number(extra));

        // move block
        this.placeBlock();
        return true;
    }

    keyPress(e) {
        if (game.stop) return;
        let key = e.key;

        key == "ArrowUp" ? piece.rotate() : 0;
        key == "ArrowLeft" ? piece.move("x;-1") : 0;
        key == "ArrowRight" ? piece.move("x;1") : 0;
        key == "ArrowDown" ? piece.move("y;1") : 0;
        key == " " ? piece.drop() : 0;
    }

    lowerAutomaticaly() {
        // lower block every 1000ms (= 1s)
        this.interval = setInterval(() => {
            if (game.stop) {
                clearInterval(this.interval);
                return;
            }

            this.move("y;1");
        }, 1000);
    }
}

/** @format */

class Game {
    constructor() {
        document.querySelector("#game").classList.remove("over");
        ctx.strokeStyle = "gray";
        ctx.lineWidth = 1;

        this.score = 0;
        this.stop = this.pause = false;

        board = this.redraw(true);
        local_scores();
        new_score(this.sore);
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
            if (row >= rows) continue;
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
        let combo = 0;

        board.map((row, i) => {
            if (!row.includes(0) && !row.includes(1) && !row.includes(2)) {
                combo += redraw ? 1 : 0;
                redraw = true;
                this.score += 100;

                // lower everything (remove row & put new row on top)
                clearSound.currentTime = 0;
                clearSound.play();
                board.splice(i, 1);
                board.splice(0, 0, new Array(cols).fill(0));
            }
        });

        this.score += 200 * combo;
        new_score(this.score);

        if (redraw) this.redraw();
    }

    togglePause() {
        this.pause = !this.pause;
    }

    end() {
        this.stop = true;

        new_score(this.score, true);
        document.querySelector("#game").classList.add("over");

        console.log("game over");

        // sound
        soundtrack.pause();
        soundtrack.currentTime = 0;
        endSound.play();

        // reset button
        startHTML.disabled = false;
        startHTML.style.opacity = "1";

        // sent new highscore to server
        upload_highscore(this.score);
    }
}

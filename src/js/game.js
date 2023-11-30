/** @format */

class Game {
    constructor() {
        document.querySelector("#game").classList.remove("over");
        ctx.strokeStyle = "gray";
        ctx.lineWidth = 1;

        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.stop = this.pause = false;

        board = this.redraw(true);
        this.drawNextBlock();
        local_scores();
        new_score(this.sore, this.level);
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

        this.shadow(false);
    }

    drawBlock(col, row, value, context = ctx) {
        if (value == 0) return;
        context.fillRect(row * block_size + 1, col * block_size + 1, block_size - 2, block_size - 2);
    }

    drawNextBlock(shape, piece, ctx2 = nextBlockCtx, canvas2 = nextBlockCanvas) {
        canvas2.width = canvas2.height = block_size * 5;
        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

        // draw grid
        ctx2.strokeStyle = "gray";
        ctx2.lineWidth = 1;

        ctx2.beginPath(false);

        for (let i = 1; i < 5; i++) {
            ctx2.moveTo(block_size * i, 0);
            ctx2.lineTo(block_size * i, canvas2.height);

            ctx2.moveTo(0, block_size * i);
            ctx2.lineTo(canvas2.height, block_size * i);
        }

        ctx2.stroke();

        // draw block
        ctx2.fillStyle = colors[piece];

        for (let i in shape) {
            let col = (i % 3) + 1;
            let row = Math.floor(i / 3) + 1;
            game.drawBlock(row, col, shape[i], ctx2);
        }
    }

    isClipping(moveRow = 0, moveCol = 0, shape, width) {
        if (!shape) shape = piece.shape;
        if (!width) width = piece.width;

        for (let i in shape) {
            let col = (i % width) + Math.floor(cols / 2) - 2 + piece.extraX;
            let row = Math.floor(i / width) + piece.extraY;

            //if out of the board
            if (row > rows) return true;
            if (shape[i] != 0 && board[row][col] == undefined) return true;

            //if on top of other block
            if (row == rows || board[row][col] == 0) continue;
            if (board[row + moveRow][col + moveCol] >= 3) return true;
        }

        return false;
    }

    validMove(move) {
        // check if on bottom row
        if (board[rows - 1].includes(1) && move == "y;1") {
            piece.disable();
            if (!this.stop) {
                piece = new Piece();
                game.redraw();
            }
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
                    if (!this.stop) {
                        piece = new Piece();
                        game.redraw();
                    }
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
                combo += 1;
                redraw = true;

                // lower everything (remove row & put new row on top)
                clearSound.currentTime = 0;
                clearSound.play();
                board.splice(i, 1);
                board.splice(0, 0, new Array(cols).fill(0));
            }
        });

        if (combo == 1) {
            this.score += 40;
        } else if (combo == 2) {
            this.score += 100;
        } else if (combo == 3) {
            this.score += 300;
        } else if (combo == 4) {
            this.score += 1200;
        }

        this.lines += combo;
        document.querySelector("#lines").innerHTML = this.lines;

        if (this.lines >= this.level * 5) {
            this.level += 1;
            this.lines = 0;
            document.querySelector("#level").innerHTML = this.level;
            auto_speed -= this.level > 5 ? 50 : 100;
        }

        new_score(this.score, this.level);
        if (redraw) this.redraw();
    }

    togglePause(setPause = undefined) {
        if (setPause != undefined) {
            this.pause = setPause;
        } else {
            this.pause = !this.pause;
        }

        // pause screen & music
        if (this.pause) {
            document.querySelector(".center.column").classList.remove("game_started");
            soundtrack.pause();
        } else {
            document.querySelector(".center.column").classList.add("game_started");
            soundtrack.play();
        }
    }

    shadow(redraw = true, block = piece) {
        if (redraw) this.redraw();
        const shape = block.shape;

        const result = (() => {
            let oldRow;

            for (let row = piece?.extraY ? piece.extraY : 0; row < rows; row++) {
                // check if valid move
                let clipping = (() => {
                    for (let i in shape) {
                        if (shape[i] == 0) continue;
                        let col = (i % block.width) + Math.floor(cols / 2) - 2 + block.extraX;
                        let rowResult = Math.floor(i / block.width) + row;

                        // out of the board or on top of other block
                        if (board[rowResult] == undefined) return true;
                        if (board[rowResult][col] > 2) return true;
                    }

                    return false;
                })();

                if (clipping) return oldRow ? oldRow : row;
                oldRow = row;
            }
        })();

        // fill blocks
        ctx.strokeStyle = colors[block.piece];
        ctx.lineWidth = 3;

        for (let i in shape) {
            let col = (i % block.width) + Math.floor(cols / 2) - 2 + block.extraX;
            let row = result + Math.floor(i / block.width);

            if (shape[i] > 0 && row < rows) {
                ctx.strokeRect(col * block_size + 1, row * block_size + 1, block_size - 2, block_size - 2);
            }
        }
    }

    swap_block() {
        let old_stored_piece = this.stored_piece;
        let old_shape = piece.shape;

        // store current shape
        this.stored_piece = piece.piece;

        // check if valid move
        if (this.isClipping(0, 0, shapes[shapeTypes[this.stored_piece]], 3)) return;
        this.drawNextBlock(shapes[shapeTypes[this.stored_piece]], this.stored_piece, storedBlockCtx, storedBlockCanvas);

        // remove current/old block = clear trail
        piece.placeBlock(false, true, old_shape);

        // draw new stored shape
        if (storedBlockCanvas.classList.contains("youtube_background")) {
            storedBlockCanvas.classList.remove("youtube_background");
        }

        if (old_stored_piece == undefined) {
            piece.placeBlock();
            return;
        }

        piece.piece = old_stored_piece;
        piece.shape = shapes[shapeTypes[old_stored_piece]];
        piece.width = 3;
        this.redraw();
        piece.placeBlock();
    }

    end() {
        this.stop = true;

        new_score(this.score, this.level, true);
        document.querySelector("#game").classList.add("over");

        console.log("game over");

        // sound
        soundtrack.pause();
        soundtrack.currentTime = 0;
        endSound.play();

        // sent new highscore to server
        upload_highscore(this.score);
    }
}

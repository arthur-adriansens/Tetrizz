/** @format */

const shapes = {
    I: [0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 1, 0],
    J: [0, 1, 0, 0, 2, 0, 1, 1, 0],
    L: [0, 1, 0, 0, 2, 0, 0, 1, 1],
    O: [0, 0, 0, 0, 2, 1, 0, 1, 1],
    S: [0, 0, 0, 0, 2, 1, 1, 1, 0],
    T: [0, 0, 0, 1, 2, 1, 0, 1, 0],
    Z: [0, 0, 0, 1, 2, 0, 0, 1, 1],
};
shapeTypes = Object.keys(shapes);

class Piece {
    constructor() {
        this.width = 3;

        // x & y cordinates
        this.extraY = this.extraX = this.mostRight = 0;
        this.placeBlock(true);

        // add key control
        document.addEventListener("keydown", this.keyPress);
        this.lowerAutomaticaly();
    }

    disable(end = false) {
        document.removeEventListener("keydown", this.keyPress);
        clearInterval(this.interval);

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
        game.redraw();
    }

    placeBlock(newBlock = false, clearTrail = false, shape = this.shape) {
        // shape
        // this.piece = newBlock ? Math.floor(Math.random() * shapeTypes.length) : this.piece;
        this.piece = 6;
        this.shape = newBlock ? shapes[shapeTypes[this.piece]] : shape;

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
                if (game.isClipping(0, 0, shapes[shapeTypes[this.piece]], 3)) return;

                this.placeBlock(false, true);
                this.shape = shapes[shapeTypes[this.piece]];
                this.width = 3;
            }

            this.placeBlock();
            return;
        }

        // convert to 2d shape (matrix)
        let matrix = Array.from({ length: Math.floor(this.shape.length / 3) }, (x, i) => this.shape.slice(i * 3, (i + 1) * 3));

        // turn counterclockwise, then reverse rows
        let transformed = matrix.map((_, colIndex) => matrix.map((row) => row[colIndex]));
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

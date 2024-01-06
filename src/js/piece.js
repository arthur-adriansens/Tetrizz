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
const shapeTypes = Object.keys(shapes);
let nextPiece = Math.floor(Math.random() * shapeTypes.length);

class Piece {
    constructor() {
        this.width = 3;

        // x & y cordinates
        this.extraY = this.extraX = this.mostRight = 0;
        this.placeBlock(true);

        // add key control
        document.addEventListener("keydown", this.keyPress);
        document.addEventListener("keyup", keyUp);
        lowerAutomaticaly();
    }

    disable(end = false) {
        document.removeEventListener("keydown", this.keyPress);
        document.addEventListener("keyup", keyUp);
        clearInterval(autoInterval);
        clearInterval(dropInterval);

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

        dropSound.currentTime = 0;
        dropSound.play();
        this.placeBlock();
        game.redraw();
    }

    placeBlock(newBlock = false, clearTrail = false, shape = this.shape) {
        // shape
        if (newBlock) {
            this.piece = nextPiece;
            this.shape = shapes[shapeTypes[this.piece]];
            shape = this.shape;
            this.nextBlock();

            this.color = colors[this.piece];

            // change logo colors
            document.documentElement.style.setProperty("--colorGradientStart", colors[this.piece]);
            document.documentElement.style.setProperty("--colorGradientEnd", colors[this.piece]);
        }

        // color
        ctx.fillStyle = clearTrail ? bgColor : colors[this.piece];

        // fill blocks
        for (let i in shape) {
            let col = (i % this.width) + Math.floor(cols / 2) - 2 + this.extraX;
            let row = Math.floor(i / this.width) + this.extraY;

            if (shape[i] != 0) {
                // check if taken
                if (newBlock && board[row][col] > 2) {
                    this.disable(true);
                    return;
                }

                // change matrix & visual board
                board[row][col] = clearTrail ? 0 : shape[i];
                game.drawBlock(row, col, shape[i]);
            }
        }

        // check for full rows
        game.checkRows();
        if (newBlock) game.shadow(false, this);
    }

    nextBlock() {
        nextPiece = Math.floor(Math.random() * shapeTypes.length);
        this.nextShape = shapes[shapeTypes[nextPiece]];
        game.drawNextBlock(this.nextShape, nextPiece);
    }

    rotate() {
        // O shape
        if (this.piece == 3) return;

        // long I shape
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
            rotateSound.currentTime = 0;
            rotateSound.play();
            game.shadow();
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
        rotateSound.currentTime = 0;
        this.placeBlock();
        rotateSound.play();
        game.shadow();
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
        axis == "y" ? (this.extraY += Number(extra)) : ((this.extraX += Number(extra)), game.shadow());

        // move block
        this.placeBlock();
        return true;
    }

    keyPress(e) {
        let key = e.key;
        key == "Escape" || key == "p" ? game.togglePause() : 0;
        key == "s" || key == "Control" ? game.swap_block() : 0;
        if (game.stop || game.pause) return;

        key == "ArrowUp" ? piece.rotate() : 0;
        key == "ArrowLeft" ? piece.move("x;-1") : 0;
        key == "ArrowRight" ? piece.move("x;1") : 0;
        key == "ArrowDown" ? keyDown() : 0;
        key == " " ? piece.drop() : 0;
    }
}

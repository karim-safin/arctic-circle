/**
 * The current Aztec diamond
 */
var diamond;

/**
 * Maximal width of a diamond (1000 corresponds to A(500))
 */
var maxSize = 1000;

/**
 * Minimal size of a cell that makes the draw methods to draw black borders
 * around tiles
 */
var minCellSizeToDrawBorder = 5;

/**
 * A set of dominoes of the same color.
 */
class DominoSet {
    constructor() {
        // this.dominoArray[x][y] = 1 if a domino with coordinates (x, y) is
        // present in the set; otherwise it is 0
        this.dominoArray = [];

        // resize the array
        for (var i = 0; i < maxSize; ++i) {
            this.dominoArray.push([]);
            for (var j = 0; j < maxSize; ++j) {
                this.dominoArray[i].push(0);
            }
        }
    }

    validCoordinates(x, y) {
        if (x < 0 || y < 0) {
            return false;
        }
        if (x >= maxSize || y >= maxSize) {
            return false;
        }
        return true;
    }

    dominoPresent(x, y) {
        if (!this.validCoordinates(x, y)) {
            return false;
        }
        return this.dominoArray[y][x] == 1;
    }

    addDomino(x, y) {
        if (!this.validCoordinates(x, y)) {
            console.log(`Trying to add a domino with coordinates (${x}, ${y}); these coords are invalid`)
        }
        if (this.dominoPresent(x, y)) {
            console.log(`Trying to add a domino with coordinates (${x}, ${y}); a domino is already present`)
        }
        this.dominoArray[y][x] = 1;
    }

    deleteDomino(x, y) {
        if (!this.validCoordinates(x, y)) {
            console.log(`Trying to delete a domino with coordinates (${x}, ${y}); these coords are invalid`)
        }
        if (!this.dominoPresent(x, y)) {
            console.log(`Trying to delete a domino with coordinates (${x}, ${y}); there is no domino there`)
        }
        this.dominoArray[y][x] = 0;
    }

    moveAllLeft() {
        var maxX = maxSize - 1;
        var minX = 0;
        var maxY = maxSize - 1;
        var minY = 0;
        for (var i = minY; i <= maxY; ++i) {
            for (var j = minX; j <= maxX - 1; ++j) {
                this.dominoArray[i][j] = this.dominoArray[i][j + 1];
            }
            this.dominoArray[i][maxX] = 0; // to clear the last column that was
            // not touched in the loop above
        }
    }

    moveAllRight() {
        var maxX = maxSize - 1;
        var minX = 0;
        var maxY = maxSize - 1;
        var minY = 0;
        for (var i = minY; i <= maxY; ++i) {
            for (var j = maxX; j >= minX + 1; --j) {
                this.dominoArray[i][j] = this.dominoArray[i][j - 1];
            }
            this.dominoArray[i][minX] = 0; // clear the first column
        }
    }

    moveAllUp() {
        var maxX = maxSize - 1;
        var minX = 0;
        var maxY = maxSize - 1;
        var minY = 0;
        for (var i = maxY; i >= minY + 1; --i) {
            for (var j = minX; j <= maxX; ++j) {
                this.dominoArray[i][j] = this.dominoArray[i - 1][j];
            }
        }
        for (var j = minX; j <= maxX; ++j) {
            this.dominoArray[minY][j] = 0; // clear the bottommost row
        }
    }

    moveAllDown() {
        var maxX = maxSize - 1;
        var minX = 0;
        var maxY = maxSize - 1;
        var minY = 0;
        for (var i = minY; i <= maxY - 1; ++i) {
            for (var j = minX; j <= maxX; ++j) {
                this.dominoArray[i][j] = this.dominoArray[i + 1][j];
            }
        }
        for (var j = minX; j <= maxX; ++j) {
            this.dominoArray[maxY][j] = 0; // clear the topmost row
        }
    }
}

/**
 * Represents a domino tiling of a square board with its four angles cur out
 *
 * like this
 * ...oo...
 * ..oooo..
 * .oooooo.
 * oooooooo
 * oooooooo
 * .oooooo.
 * ..oooo..
 * ...oo...
 *
 * see https://www.youtube.com/watch?v=Yy7Q8IWNfHM&t=1139s
 */
class AztecDiamond {
	/**
	 * Initializes this diamond as A(1).
	 */
	constructor() {
		// the four colors of dominoes
		// orange moves left, red moves right,
		// green moves down, blue moves up
		// this is packed in an object so that I could iterate over these four
		// sets
		this.colors = {
			"orange": new DominoSet(),
			"red": new DominoSet(),
			"blue": new DominoSet(),
			"green": new DominoSet(),
		};

		// fill this with a random A(1) diamond
		this.addRandomA1(0, 0);
		this.size = 1;

		// is used in fillWithA1s
		this.occupied = [];
		for (var i = 0; i < maxSize; ++i) {
			this.occupied.push([]);
			for (var j = 0; j < maxSize; ++j) {
				this.occupied[i].push(0);
			}
		}
	}

	/**
	 * Adds a random A(1) subdiamond whose bottom left corner is in (x, y).
	 */
	addRandomA1(x, y) {
		// there are two variants of A(1) -- horizontal and vertical. Choose one
		var r = Math.floor(Math.random() * 2);
		if (r == 0) {
			this.colors["orange"].addDomino(x, y);
			this.colors["red"].addDomino(x + 1, y);
		} else {
			this.colors["green"].addDomino(x, y);
			this.colors["blue"].addDomino(x, y + 1);
		}
	}

	/**
	 * Increases the size of the board without adding more dominoes.
	 * Transform this
	 * .oo.
	 * oooo
	 * oooo
	 * .oo.
	 *
	 * into this
	 *
	 * ......
	 * ..oo..
	 * .oooo.
	 * .oooo.
	 * ..oo..
	 * ......
	 */
	expand() {
		for (var color in this.colors) {
			this.colors[color].moveAllUp();
			this.colors[color].moveAllRight();
		}
		this.size = this.size + 1;
	}

	/**
	 * Deletes pairs of tiles that cannot move because they clash one with
	 * another.
	 * A red tile cannot stand to the left of an orange one, and a green tile
	 * cannot be above a blue one.
	 */
	deleteClashingTiles() {
		for (var x = 0; x < 2 * this.size; ++x) {
			for (var y = 0; y < 2 * this.size; ++y) {
				if (   this.colors["red"].dominoPresent(x, y)
					&& this.colors["orange"].dominoPresent(x + 1, y)) {
					this.colors["red"].deleteDomino(x, y);
					this.colors["orange"].deleteDomino(x + 1, y);
				}
				if (   this.colors["blue"].dominoPresent(x, y)
					&& this.colors["green"].dominoPresent(x, y + 1)) {
					this.colors["blue"].deleteDomino(x, y);
					this.colors["green"].deleteDomino(x, y + 1);
				}
			}
		}
	}

	/**
	 * Moves all red tile to the right, orange tiles to the left, blue tiles up
	 * and green tiles down.
	 */
	moveAllColors() {
		this.colors["red"].moveAllRight();
		this.colors["orange"].moveAllLeft();
		this.colors["blue"].moveAllUp();
		this.colors["green"].moveAllDown();
	}

	/**
	 * Fills the "occupied" array with zeroes
	 */
	clearOccupied() {
		for (var i = 0; i < 2 * this.size; ++i) {
			for (var j = 0; j < 2 * this.size; ++j) {
				this.occupied[i][j] = 0;
			}
		}
	}

	/**
	 * Fills the "occupied" array with the current tiling
	 */
	constructOccupied() {
		this.clearOccupied();
		for (var x = 0; x < 2 * this.size; ++x) {
			for (var y = 0; y < 2 * this.size; ++y) {
				for (var color in this.colors) {
					// if a domino is present in this tile,
					if (this.colors[color].dominoPresent(x, y)) {
						// it is occupied
						this.occupied[y][x] = 1;
						// if the color is orange or red
						if (color == "orange" || color == "red") {
							// then there tile above is also occupied
							this.occupied[y + 1][x] = 1;
						} else {
							// if the color is blue or green, then the tile to
							// the right is occupied
							this.occupied[y][x + 1] = 1;
						}
					}
				}
			}
		}
	}

	/**
	 * Finds all empty 2x2 blocks and fills them with random A(1) diamonds.
	 */
	fillWithA1s() {
		this.constructOccupied();
		for (var x = 0; x < 2 * this.size; ++x) {
			var d;
			// let this.size = 3
			// d = 3 - 0 - 1 = 2
			// d = 3 - 1 - 1 = 1
			// d = 3 - 2 - 1 = 0
			// d = 3 - 3 = 0
			// d = 4 - 3 = 1
			// d = 5 - 3 = 2
			if (x < this.size) {
				d = this.size - x - 1;
			}
			else {
				d = x - this.size;
			}
			// d = 2; y = [2; 2 * 3 - 2)
			// d = 1; y = [1; 2 * 3 - 1)
			// d = 0; y = [0; 2 * 3 - 0)
			for (var y = d; y < 2 * this.size - d; ++y) {
				// if all four tiles (x, y), (x+1, y), (x, y+1) and (x+1, y+1)
				// are all occupied,
				if (  this.occupied[y][x]
					+ this.occupied[y][x + 1]
					+ this.occupied[y + 1][x]
					+ this.occupied[y + 1][x + 1] == 0) {
					this.addRandomA1(x, y);
					this.occupied[y][x] = 1;
					this.occupied[y][x + 1] = 1;
					this.occupied[y + 1][x] = 1;
					this.occupied[y + 1][x + 1] = 1;
				}
			}
		}
	}

	/**
	 * Transforms this diamond from A(i) to A(i + 1) by doing a step of square
	 * dance described in the video linked in this class' description.
	 */
	increment() {
		this.expand();
		this.deleteClashingTiles();
		this.moveAllColors();
		this.fillWithA1s();
	}
}

/**
 * Draws all the cells of a given color
 */
function drawColor(context, dominoSet, orientation, color, size) {
	for (var x = 0; x < diamond.size * 2; ++x) {
		for (var y = 0; y < diamond.size * 2; ++y) {
			if (dominoSet.dominoPresent(x, y)) {
				context.fillStyle = color;
				if (orientation == 0) { // vertical
					context.fillRect(x * size,
						             y * size,
						             size,
						             size * 2);
				} else { // horizontal
					context.fillRect(x * size,
						             y * size,
						             size * 2,
						             size);
				}
				// if the cell size is big enough, draw a border
				if (size >= minCellSizeToDrawBorder) {
					context.fillStyle = "black";
					context.beginPath();
					if (orientation == 0) { // vertical
						context.rect(x * size,
							         y * size,
							         size,
							         size * 2);
					} else { // horizontal
						context.rect(x * size,
							         y * size,
							         size * 2,
							         size);
					}
					context.stroke();
				}
			}
		}
	}
}

function drawDiamond() {
    var c = document.getElementById("mainCanvas");
    var ctx = c.getContext("2d");
    var cellSize = Math.floor(c.width / (diamond.size * 2));
    cellSize = Math.max(1, cellSize);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, c.width, c.width);
    ctx.save();
    // Translate the origin so that the diamond is drawn at the center of the
    // window
    ctx.translate(Math.floor(c.width - cellSize * diamond.size * 2) / 2, 0);
    drawColor(ctx, diamond.colors["orange"], 0, "orange", cellSize);
    drawColor(ctx, diamond.colors["red"],    0, "red", cellSize);
    drawColor(ctx, diamond.colors["blue"],   1, "blue", cellSize);
    drawColor(ctx, diamond.colors["green"],  1, "green", cellSize);
    ctx.restore();
}

/**
 * Creates a 2x2 Aztec diamond
 */
function setupGame() {
	diamond = new AztecDiamond();
    drawDiamond();
}

/**
 * Expands the Aztec diamond.
 * Stops when its width is 1000.
 */
function onMouseClick(event) {
	if (diamond.size >= 499) {
		return;
	}
	diamond.increment();
	drawDiamond();
}

function setCanvasSize(width, height) {
    var canvas = document.getElementById("mainCanvas");
    width = Math.floor(width);
    height = Math.floor(height);
    var diamondSizeTwice = diamond.size * 2;
    width = width - width % diamondSizeTwice; // now width is divisible by diamondSizeTwice
    height = height - height % diamondSizeTwice; // the same with height
    canvas.width = width;
    canvas.height = height;
}

/**
 * Makes sure that the canvas will fit into body but won't be larger than
 * maxCanvasSize declared at the beginning of the file
 */
function onResize() {
    var bodyWidth = window.innerWidth;
    var bodyHeight = window.innerHeight;
    var minimalDimension = Math.min(bodyWidth, bodyHeight);
    var minimalDimensionPadded = minimalDimension * 0.9;
    setCanvasSize(minimalDimensionPadded, minimalDimensionPadded);
    if (diamond != undefined) {
        drawDiamond();
    }
}

function testMoveAllUp() {
    var inp = [[0, 0, 0, 0],
               [0, 1, 1, 0],
               [0, 1, 1, 0],
               [0, 0, 0, 0]];
    // "Up" is when the Y coordinate increases, so "want" array is correct
    var want = [[0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 1, 1, 0],
                [0, 1, 1, 0]];
    var ds = new DominoSet();
    for (var i = 0; i < 4; ++i) {
        for (var j = 0; j < 4; ++j) {
            if (inp[i][j] == 1) {
                ds.addDomino(j, i);
            }
        }
    }
    ds.moveAllUp();
    var anyErrors = false;
    for (var i = 0; i < 4; ++i) {
        for (var j = 0; j < 4; ++j) {
            if (want[i][j] == 1 && !ds.dominoPresent(j, i)) {
                anyErrors = true;
                console.log(`Error in testMoveAllUp: want a domino at position (${j},${i})`);
            }
            if (want[i][j] == 0 && ds.dominoPresent(j, i)) {
                anyErrors = true;
                console.log(`Error in testMoveAllUp: want no domino at position (${j},${i})`);
            }
        }
    }
    if (!anyErrors) {
        console.log("testMoveAllUp passed successfully")
    } else {
        var got = want;
        for (var i = 0; i < 4; ++i) {
            for (var j = 0; j < 4; ++j) {
                if (ds.dominoPresent(j, i)) {
                    got[i][j] = 1;
                } else {
                    got[i][j] = 0;
                }
            }
        }
        console.log("Got: ")
        for (var i = 0; i < 4; ++i) {
            console.log(got[i])
        }
        console.log("Want: ")
        for (var i = 0; i < 4; ++i) {
            console.log(want[i])
        }
    }
}

function testMoveAllDown() {
    var inp = [[0, 0, 0, 0],
               [0, 1, 1, 0],
               [0, 1, 1, 0],
               [0, 0, 0, 0]];
    // "Down" is when the Y coordinate decreases, so "want" array is correct
    var want = [[0, 1, 1, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]];
    var ds = new DominoSet();
    for (var i = 0; i < 4; ++i) {
        for (var j = 0; j < 4; ++j) {
            if (inp[i][j] == 1) {
                ds.addDomino(j, i);
            }
        }
    }
    ds.moveAllDown();
    var anyErrors = false;
    for (var i = 0; i < 4; ++i) {
        for (var j = 0; j < 4; ++j) {
            if (want[i][j] == 1 && !ds.dominoPresent(j, i)) {
                anyErrors = true;
                console.log(`Error in testMoveAllDown: want a domino at position (${j},${i})`);
            }
            if (want[i][j] == 0 && ds.dominoPresent(j, i)) {
                anyErrors = true;
                console.log(`Error in testMoveAllDown: want no domino at position (${j},${i})`);
            }
        }
    }
    if (!anyErrors) {
        console.log("testMoveAllDown passed successfully")
    } else {
        var got = want;
        for (var i = 0; i < 4; ++i) {
            for (var j = 0; j < 4; ++j) {
                if (ds.dominoPresent(j, i)) {
                    got[i][j] = 1;
                } else {
                    got[i][j] = 0;
                }
            }
        }
        console.log("Got: ")
        for (var i = 0; i < 4; ++i) {
            console.log(got[i])
        }
        console.log("Want: ")
        for (var i = 0; i < 4; ++i) {
            console.log(want[i])
        }
    }
}

function testMoveAllLeft() {
    var inp = [[0, 0, 0, 0],
               [0, 1, 1, 0],
               [0, 1, 1, 0],
               [0, 0, 0, 0]];
    // "Down" is when the Y coordinate decreases, so "want" array is correct
    var want = [[0, 0, 0, 0],
                [1, 1, 0, 0],
                [1, 1, 0, 0],
                [0, 0, 0, 0]];
    var ds = new DominoSet();
    for (var i = 0; i < 4; ++i) {
        for (var j = 0; j < 4; ++j) {
            if (inp[i][j] == 1) {
                ds.addDomino(j, i);
            }
        }
    }
    ds.moveAllLeft();
    var anyErrors = false;
    for (var i = 0; i < 4; ++i) {
        for (var j = 0; j < 4; ++j) {
            if (want[i][j] == 1 && !ds.dominoPresent(j, i)) {
                anyErrors = true;
                console.log(`Error in testMoveAllLeft: want a domino at position (${j},${i})`);
            }
            if (want[i][j] == 0 && ds.dominoPresent(j, i)) {
                anyErrors = true;
                console.log(`Error in testMoveAllLeft: want no domino at position (${j},${i})`);
            }
        }
    }
    if (!anyErrors) {
        console.log("testMoveAllLeft passed successfully")
    } else {
        var got = want;
        for (var i = 0; i < 4; ++i) {
            for (var j = 0; j < 4; ++j) {
                if (ds.dominoPresent(j, i)) {
                    got[i][j] = 1;
                } else {
                    got[i][j] = 0;
                }
            }
        }
        console.log("Got: ")
        for (var i = 0; i < 4; ++i) {
            console.log(got[i])
        }
        console.log("Want: ")
        for (var i = 0; i < 4; ++i) {
            console.log(want[i])
        }
    }
}

function testMoveAllRight() {
    var inp = [[0, 0, 0, 0],
               [0, 1, 1, 0],
               [0, 1, 1, 0],
               [0, 0, 0, 0]];
    // "Down" is when the Y coordinate decreases, so "want" array is correct
    var want = [[0, 0, 0, 0],
                [0, 0, 1, 1],
                [0, 0, 1, 1],
                [0, 0, 0, 0]];
    var ds = new DominoSet();
    for (var i = 0; i < 4; ++i) {
        for (var j = 0; j < 4; ++j) {
            if (inp[i][j] == 1) {
                ds.addDomino(j, i);
            }
        }
    }
    ds.moveAllRight();
    var anyErrors = false;
    for (var i = 0; i < 4; ++i) {
        for (var j = 0; j < 4; ++j) {
            if (want[i][j] == 1 && !ds.dominoPresent(j, i)) {
                anyErrors = true;
                console.log(`Error in testMoveAllRight: want a domino at position (${j},${i})`);
            }
            if (want[i][j] == 0 && ds.dominoPresent(j, i)) {
                anyErrors = true;
                console.log(`Error in testMoveAllRight: want no domino at position (${j},${i})`);
            }
        }
    }
    if (!anyErrors) {
        console.log("testMoveAllRight passed successfully")
    } else {
        var got = want;
        for (var i = 0; i < 4; ++i) {
            for (var j = 0; j < 4; ++j) {
                if (ds.dominoPresent(j, i)) {
                    got[i][j] = 1;
                } else {
                    got[i][j] = 0;
                }
            }
        }
        console.log("Got: ")
        for (var i = 0; i < 4; ++i) {
            console.log(got[i])
        }
        console.log("Want: ")
        for (var i = 0; i < 4; ++i) {
            console.log(want[i])
        }
    }
}

function runAllTests() {
	testMoveAllUp();
	testMoveAllDown();
	testMoveAllLeft();
	testMoveAllRight();
}
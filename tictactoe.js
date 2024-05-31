function Gameboard() {
    const rows = 3;
    const cols = 3;
    const board = [];

    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < cols; j++) {
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;

    const resetBoard = () => {
        for (let i = 0; i < rows; i++) {
            board[i] = [];
            for (let j = 0; j < cols; j++) {
                board[i].push(Cell());
            }
        }
    }

    return { getBoard, resetBoard };
};

function Cell() {
    let value = '';

    const setValue = (player) => {
        value = player;
    }

    const getValue = () => value;

    return { setValue, getValue };
}


function GameController(playerOneName = "Player One", playerTwoName = "Player Two") {
    let board = Gameboard();
    let players = [Player(playerOneName, "X"), Player(playerTwoName, "O")];
    let activePlayer = players[0];
    let gameOver = false;

    const switchPlayerTurn = () => {
        activePlayer = players[0] === activePlayer ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer;

    const newRound = () => {
        displayController.renderBoard();
        displayController.updateMessage(`${getActivePlayer().name} (${getActivePlayer().token})'s turn.`)
    }

    const playRound = (row, col) => {
        if (gameOver) return;

        if (board.getBoard()[row][col].getValue() === '') {
            board.getBoard()[row][col].setValue(getActivePlayer().token);
            displayController.updateCell(row, col);

            if (checkWin()) {
                displayController.updateMessage(`${getActivePlayer().name} wins!`)
                displayController.renderBoard();
                gameOver = true;
                displayController.highlightWinningCells(checkWin());
                activePlayer = players[0];
                return;
            } else if (isBoardFull()) {
                displayController.updateMessage("It's a tie!");
                displayController.renderBoard();
                gameOver = true;
                activePlayer = players[0];
                return;
            }

            switchPlayerTurn();
            newRound();

        } else {
            displayController.updateMessage("Square is taken, try again.");
        }

    }

    const checkWin = () => {
        const currentBoard = board.getBoard();

        const winningCombinations = [
            // Rows
            [[0, 0], [0, 1], [0, 2]],
            [[1, 0], [1, 1], [1, 2]],
            [[2, 0], [2, 1], [2, 2]],
            // Columns
            [[0, 0], [1, 0], [2, 0]],
            [[0, 1], [1, 1], [2, 1]],
            [[0, 2], [1, 2], [2, 2]],
            // Diagonals
            [[0, 0], [1, 1], [2, 2]],
            [[0, 2], [1, 1], [2, 0]]
        ];

        for (const combination of winningCombinations) {
            const [a, b, c] = combination;
            if (currentBoard[a[0]][a[1]].getValue() !== "" &&
                currentBoard[a[0]][a[1]].getValue() === currentBoard[b[0]][b[1]].getValue() &&
                currentBoard[a[0]][a[1]].getValue() === currentBoard[c[0]][c[1]].getValue()) {
                return combination;
            }
        }
        return false;
    }

    const isBoardFull = () => {
        const currentBoard = board.getBoard();
        for (const row of currentBoard) {
            for (const cell of row) {
                if (cell.getValue() === "") {
                    return false;
                }
            }
        }
        return true;
    }

    const displayController = (() => {
        const gameboardDiv = document.querySelector("#gameboard");
        const displayBoard = board.getBoard();

        const updateMessage = (message) => {
            const messageDiv = document.querySelector("#message");
            messageDiv.textContent = message;
        }

        const renderBoard = () => {
            gameboardDiv.innerHTML = "";
            displayBoard.forEach((row, rowIndex) => {
                row.forEach((cell, cellIndex) => {
                    const cellDiv = document.createElement("div");
                    cellDiv.textContent = cell.getValue();
                    cellDiv.classList.add("cell", `cell-${rowIndex}-${cellIndex}`);
                    cellDiv.addEventListener("click", () => {
                        playRound(rowIndex, cellIndex);
                    });
                    gameboardDiv.append(cellDiv);
                });
            });
        }

        const updateCell = (row, col) => {
            const cell = document.querySelector(`.cell-${row}-${col}`);
            cell.textContent = board.getBoard()[row][col].getValue();
        }

        const nameForm = document.querySelector("#player-form");
        nameForm.addEventListener("submit", (e) => {
            e.preventDefault();
            players[0].name = document.querySelector("#player1").value;
            players[1].name = document.querySelector("#player2").value;
            newRound();
        });

        const resetButton = document.querySelector("#reset");
        resetButton.addEventListener("click", () => {
            board.resetBoard();
            gameOver = false;
            activePlayer = players[0]
            newRound();
            displayController.renderBoard();
        });

        const highlightWinningCells = (combination) => {
            combination.forEach(([row, col]) => {
                const cell = document.querySelector(`.cell-${row}-${col}`);
                cell.classList.add("win");
            })
        }

        return { renderBoard, updateCell, updateMessage, highlightWinningCells }

    })();

    displayController.renderBoard();

    return { playRound, getActivePlayer, getBoard: board.getBoard }
}

function Player(name, token) {
    return { name, token };
}

GameController();
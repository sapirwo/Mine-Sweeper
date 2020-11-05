'use strict';
var gBoard;
var gMinesLocations;
var gLevel = {
    SIZE: 4,
    MINES: 2,
    LEVEL_NAME: 'Medium'
};
var gRestOfMines = gLevel.MINES;
var gGame = {
    isOn: false,
    isFirstClick: true,
    shownCount: 0, // How many cells are revealed.
    markedCount: 0, //How many cells are marked (with a flag)
    secsPassed: 0,
    lifeCount: 0
};
var gNUMBER_ONE = '1️⃣'
var gNUMBER_TWO = '2️⃣'
var gNUMBER_THREE = '3️⃣'
var gNUMBER_FOUR = '4️⃣'
var gNUMBER_FIVE = '5️⃣'
var gNUMBER_SIX = '6️⃣'
var gNUMBER_SEVEN = '7️⃣'
var gNUMBER_EIGHT = '8️⃣'
var gFLAG = '⛳'
var gMINE = '💣'

function buildBoard(boardSize) {
    resetGame()
    stopTimer()
    resetTimer()
    renderHintEmojis(boardSize)
    renderSafeClickEmojis(boardSize)
    var elH1 = document.body.querySelector('h1');
    var elMonitorEmoji = document.querySelector('.monitorEmoji');
    var elMineCount = document.querySelector('.mineCount');
    var elLifeCounter = document.querySelector('.lifeCounter');
    setGameLevel(boardSize);
    renderBestGameForThisLevel()
    elLifeCounter.innerText = setLifeCounter(boardSize);
    gHintsRest = gGame.lifeCount;
    elH1.innerText = 'Mine Sweeper'
    elMonitorEmoji.innerText = '😀|'
    elMineCount.innerText = '💣: ' + gLevel.MINES
    gBoard = createBoardModel(boardSize)
    renderBoard()
    return gBoard;
}

function renderBoard() {
    let strHtml = '';
    for (let i = 0; i < gBoard.length; i++) {
        strHtml += '<tr>'
        for (let j = 0; j < gBoard[i].length; j++) {
            let cellInTxt = '';
            let cell = gBoard[i][j];
            let cellClass = '';
            if (cell.isShown) {
                cellClass += ' shown';
                if (cell.minesAroundCount !== 0) {
                    cellInTxt = getCellInTxt(cell);
                }
                if (cell.isMine) {
                    cellClass += ' mine';
                    cellInTxt = gMINE;
                }
                if (cell.isMarked) {
                    cellClass += ' marked';
                    cellInTxt = gFLAG;
                }
            } else {
                cellClass += ' hiden';
            }
            strHtml += `<td id = "${i}-${j}" class="cell ${cellClass}" onclick="cellClicked('leftClick' ,this, ${i}, ${j})"  oncontextmenu="cellClicked('rightClick' ,event, ${i}, ${j})">${cellInTxt}`
            strHtml += '</td>'
        }
        strHtml += '</tr>'
    }

    const elBoard = document.querySelector('.board');
    elBoard.innerHTML = `<tbody class="board">${strHtml}</tbody>`;
}

function cellClicked(clickType, ev, i, j) {
    if (!gGame.isOn) {
        alert('Please choose a board (Beginner/Medium/Expert!)')
        return
    }
    var cellInModel = gBoard[i][j];
    if (clickType === 'rightClick') {
        ev.preventDefault();
        if (gIsHintMode) return;
        if (cellInModel.isRevealed) return
        if (!cellInModel.isMarked && !cellInModel.isShown && !gGame.isFirstClick) {
            cellInModel.isMarked = true;
            cellInModel.isShown = true;
            gGame.markedCount++;
            checkGameOver(cellInModel, clickType);
        } else {
            cellInModel.isMarked = false;
            cellInModel.isShown = false;
            if (!gGame.isFirstClick) gGame.markedCount--;
        }
        renderBoard();
    } else {
        if (cellInModel.isShown || cellInModel.isRevealed) return
        else cellInModel.isShown = cellInModel.isRevealed = true;
        if (gGame.isFirstClick) {
            startTimer()
            SetMinesAtRandomLocation()
            setMinesNegsCount()
            renderBoard();
            gGame.shownCount++
            gGame.isFirstClick = false
        } else {
            if (gIsHintMode) {
                hintModeTimeout(i, j, cellInModel);
                return
            } else if (!cellInModel.isMine) {
                if (cellInModel.minesAroundCount === 0) {
                    gGame.shownCount++
                    revealEmptyNegs(i, j, gBoard);
                } else gGame.shownCount++
            }
            checkGameOver(cellInModel, clickType)
            renderBoard();
        }
    }
}

function checkGameOver(cell, clickType) {
    var elMineCount = document.querySelector('.mineCount');
    if (clickType !== 'rightClick') {
        if (cell.isMine) {
            if (gGame.lifeCount === 0) {
                gRestOfMines--;
                gLevel.MINES--;
                elMineCount.innerText = '💣: ' + gRestOfMines;
                gameOver('Game Over!');
            } else {
                gRestOfMines--;
                gLevel.MINES--;
                elMineCount.innerText = '💣: ' + gRestOfMines;
                gGame.lifeCount--;
                renderLifeCounter();
            }
        }
    }
    if (gGame.shownCount === (gLevel.SIZE - gMinesLocations.length) && gGame.markedCount === gRestOfMines) {
        gameOver('You Win!');
    }
    return false
}

function gameOver(msg) {
    stopTimer()
    var elMonitorEmoji = document.querySelector('.monitorEmoji');
    var elH1 = document.body.querySelector('h1');
    elH1.innerText = '' + msg
    switch (msg) {
        case 'Game Over!':
            elMonitorEmoji.innerText = '😭|'
            revealMinesWhenGameOver()
            break
        case 'You Win!':
            elMonitorEmoji.innerText = '😎|'
            storeBestGame()
    }
    gGame = {
        isOn: false,
        isFirstClick: true,
        shownCount: 0, // How many cells are revealed.
        markedCount: 0, //How many cells are marked (with a flag)
        secsPassed: 0,
        lifeCount: 0
    };
    gMinesLocations = 0;
}
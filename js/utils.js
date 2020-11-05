'use strict';
var gTimerStartedAt = 0;
var gAbsolutStartedTime = 0;
var gTimerInterval = 0;
var gSec01 = 0;
var gSec10 = 0;
var gMin01 = 0
var gMin10 = 0;
var gHintsRest = 0;
var gSafeClickRest = 0;
var gIsHintMode = false
var gHintModeRevealedCells = [];
var gIsSafeClickMode = false;
var gBestTimeForThisLevel = 0;

function resetGame() {
    resetTimer()
    gLevel.MINES = 0;
    gGame.isFirstClick = true;
    gGame.shownCount = 0;// How many cells are revealed.
    gGame.markedCount = 0; //How many cells are marked (with a flag)
    gGame.secsPassed = 0;
    gGame.lifeCount = 0;
    gGame.isOn = true;
    gIsSafeClickMode = false;
    gIsHintMode = false;
}

function createBoardModel(boardSize = 16) {
    var rowsAndCols = Math.sqrt(boardSize);
    var mat = []
    for (var i = 0; i < rowsAndCols; i++) {
        mat.push([])
        for (var j = 0; j < rowsAndCols; j++) {
            mat[i][j] = {
                location: { i, j },
                minesAroundCount: 0,
                isShown: false, 
                isMine: false,
                isMarked: false,
                isRevealed: false
            }
        }
    }
    return mat;
}

function setGameLevel(boardSize) {
    gLevel.SIZE = boardSize;
    switch (boardSize) {
        case 16: gLevel.MINES = 2;
            gLevel.LEVEL_NAME = 'beginner'
            break;
        case 64: gLevel.MINES = 12;
            gLevel.LEVEL_NAME = 'medium'
            break;
        case 144: gLevel.MINES = 30;
            gLevel.LEVEL_NAME = 'expert'
            break;
    }
    gRestOfMines = gLevel.MINES;
}

function setLifeCounter(boardSize) {
    var htmlLifeStr = '';
    switch (boardSize) {
        case 16: gGame.lifeCount = 1;
            break;
        case 64: gGame.lifeCount = 3;
            break;
        case 144: gGame.lifeCount = 5;
            break;
    }
    for (var i = 0; i < gGame.lifeCount; i++) {
        htmlLifeStr += '❤️';
    }
    return htmlLifeStr;
}

function renderLifeCounter() {
    var htmlLifeStr = '';
    var elLifeCounter = document.querySelector('.lifeCounter');
    for (var i = 0; i < gGame.lifeCount; i++) {
        htmlLifeStr += '❤️';
    }
    if (htmlLifeStr === '') htmlLifeStr = ''
    elLifeCounter.innerText = htmlLifeStr;
}

function SetMinesAtRandomLocation() {
    var allCellsLocaion = []
    var minesLocation = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isRevealed) continue;
            allCellsLocaion.push(gBoard[i][j].location);
        }
    }
    allCellsLocaion = shuffle(allCellsLocaion);

    for (var i = 0; i < gLevel.MINES; i++) {
        var randLocation = allCellsLocaion.splice(0, 1)
        var rIdx = randLocation[0].i
        var jIdx = randLocation[0].j
        gBoard[rIdx][jIdx].isMine = true
        minesLocation.push(randLocation);
    }
    gMinesLocations = minesLocation;
    return minesLocation;
}

function setMinesNegsCount(board) {
    var board = gBoard
    var cellsWithNegs = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            if (cell.isMine) continue
            var numOfMinesAround = checkNeighbors(i, j, board)
            cell.minesAroundCount = numOfMinesAround;
            cellsWithNegs.push(cell);
        }
    }
    return cellsWithNegs;
}

function checkNeighbors(rowsIdx, colsIdx, mat) {
    var count = 0
    for (var i = rowsIdx - 1; i <= rowsIdx + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = colsIdx - 1; j <= colsIdx + 1; j++) {
            if (j < 0 || j >= mat.length) continue
            if (j === colsIdx && i === rowsIdx) continue
            if (mat[i][j].isMine) count++;
        }
    }
    return count;
}

function getCellInTxt(cell) {
    switch (cell.minesAroundCount) {
        case 1: return gNUMBER_ONE;
        case 2: return gNUMBER_TWO;
        case 3: return gNUMBER_THREE;
        case 4: return gNUMBER_FOUR;
        case 5: return gNUMBER_FIVE;
        case 6: return gNUMBER_SIX;
        case 7: return gNUMBER_SEVEN;
        case 8: return gNUMBER_EIGHT;

    }
}

function revealEmptyNegs(rowsIdx, colsIdx, mat) {
    var revealedCells = [];
    if (gBoard[rowsIdx][colsIdx].minesAroundCount !== 0) return;
    for (var i = rowsIdx - 1; i <= rowsIdx + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = colsIdx - 1; j <= colsIdx + 1; j++) {
            if (j < 0 || j >= mat.length) continue
            if (j === colsIdx && i === rowsIdx) continue
            var neg = mat[i][j];
            if (!neg.isMine && !neg.isRevealed) {
                neg.isShown = neg.isRevealed = true;
                gGame.shownCount++
                revealedCells.push(neg);
            }
        }
    }
    return revealedCells;
}


function startTimer() {
    gSec01 = 0;
    gSec10 = 0;
    gMin01 = 0
    gMin10 = 0;
    gTimerStartedAt = Date.now();
    gAbsolutStartedTime = gTimerStartedAt;
    gTimerInterval = setInterval(timer, 1);
}

function stopTimer() {
    clearInterval(gTimerInterval);
}

function resetTimer() {
    gAbsolutStartedTime = 0;
    gSec01 = 0;
    gSec10 = 0;
    gMin01 = 0
    gMin10 = 0;
    document.querySelector('.sec01').innerText = gSec01
    document.querySelector('.sec10').innerText = gSec10
    document.querySelector('.min01').innerText = gMin01
    document.querySelector('.min10').innerText = gMin10
}

function timer() {
    gSec01 = parseInt((Date.now() - gTimerStartedAt) / 1000);


    if (gSec01 === 10) {
        gSec10++;
        gTimerStartedAt = Date.now();
    }
    if (gSec10 === 6) {
        gMin01++;
        gSec10 = 0;
    }
    if (gMin01 === 10) {
        gMin10++;
        gMin01 = 0;
    }
    if (gMin10 === 6) { //until one hour!
        return
    }
    document.querySelector('.sec01').innerText = gSec01
    document.querySelector('.sec10').innerText = gSec10
    document.querySelector('.min01').innerText = gMin01
    document.querySelector('.min10').innerText = gMin10
}

function setToHintMode() {
    var elHint = document.querySelector(`.hint${gHintsRest}`)
    if (!gGame.isFirstClick && gHintsRest !== 0) {
        gIsHintMode = true;
        elHint.innerText = '😉'
    }
}

function hintModeTimeout(i, j, cellInModel) {
    gIsHintMode = false
    cellInModel.isShown = true;
    hintNegsReveal(i, j)
    setTimeout(StopHintModeAndHideCells, 1000);
    gHintsRest--;
}

function hintNegsReveal(rowsIdx, colsIdx) {
    var revealedCells = [];
    for (var i = rowsIdx - 1; i <= rowsIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colsIdx - 1; j <= colsIdx + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue
            if (j === colsIdx && i === rowsIdx) continue
            var neg = gBoard[i][j];
            if (!neg.isRevealed && !neg.isMarked) {
                neg.isShown = neg.isRevealed = true;
                revealedCells.push(neg);
            }
        }
    }

    gHintModeRevealedCells = revealedCells;
    renderBoard();
    revealedCells.push(gBoard[rowsIdx][colsIdx])
    return revealedCells;
}

function StopHintModeAndHideCells() {

    var elHint = document.querySelector(`.hint${gHintsRest + 1}`)

    for (var i = 0; i < gHintModeRevealedCells.length; i++) {
        var idxI = gHintModeRevealedCells[i].location.i;
        var idxJ = gHintModeRevealedCells[i].location.j;
        var cellInModel = gBoard[idxI][idxJ];
        cellInModel.isShown = cellInModel.isRevealed = false;
    }
    elHint.innerText = '😴'
    renderBoard();
}

function revealMinesWhenGameOver() {
    for (var i = 0; i < gMinesLocations.length; i++) {
        var cellIdxI = gMinesLocations[i][0].i
        var cellIdxJ = gMinesLocations[i][0].j
        gBoard[cellIdxI][cellIdxJ].isShown = true;
        renderBoard();
    }
}

function renderHintEmojis(boardSize) {
    var elHintBar = document.querySelector('.hintBar');
    var hintBarHtmlStr = '<div class="hintBar"><span class="hintTxt">Hint?</span>';
    var numOfEmo = 0;
    switch (boardSize) {
        case 16: numOfEmo = 1;
            break;
        case 64: numOfEmo = 3;
            break;
        case 144: numOfEmo = 5;
            break;
    }
    for (var i = 0; i < numOfEmo; i++) {
        hintBarHtmlStr += `<span class="hint${i + 1}" onclick="setToHintMode()">🤓</span>`
    }
    hintBarHtmlStr += '</div>';
    elHintBar.innerHTML = hintBarHtmlStr;
}


function renderSafeClickEmojis(boardSize) {
    var elSafeClick = document.querySelector('.safeClicks');
    var safeClickHtmlStr = '<span class="safeClicks">';
    var numOfSafeClicks = 0;
    switch (boardSize) {
        case 16: numOfSafeClicks = 1;
            break;
        case 64: numOfSafeClicks = 3;
            break;
        case 144: numOfSafeClicks = 5;
            break;
    }
    gSafeClickRest = numOfSafeClicks
    for (var i = 0; i < numOfSafeClicks; i++) {
        safeClickHtmlStr += `<span class="safeClick${i + 1}" onclick="setToSafeClickMode()">🖐🏿</span>`
    }
    safeClickHtmlStr += '|</span>';
    elSafeClick.innerHTML = safeClickHtmlStr;
}

function setToSafeClickMode() {
    gIsSafeClickMode = true;
    var elSafeClick = document.querySelector(`.safeClick${gSafeClickRest}`)
    if (!gGame.isFirstClick && gSafeClickRest !== 0) {
        gIsSafeClickMode = true;
        elSafeClick.innerText = '✌🏿'
        var safeCell = findSafeCell()
        showSafeCell(safeCell)
        SafeClickModeOff();
    }
}

function findSafeCell() {
    var safeCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            if (!cell.isMine && !cell.isMarked && !cell.isRevealed && !cell.isShown) {
                safeCells.push(cell);
            }

        }
    }
    safeCells = shuffle(safeCells);
    var safeCell = safeCells.splice(0, 1);
    return safeCell
}

function showSafeCell(safeCell) {
    var cellIdxI = safeCell[0].location.i
    var cellIdxJ = safeCell[0].location.j
    var elCell = document.getElementById(`${cellIdxI}-${cellIdxJ}`);
    elCell.style = 'background-color: #b2b2e0;';
}

function SafeClickModeOff() {
    var elSafeClick = document.querySelector(`.safeClick${gSafeClickRest}`)
    gIsSafeClickMode = false
    elSafeClick.innerText = '🤙🏿'
    gSafeClickRest--;
}

function shuffle(array) {
    var newArray = []
    var random = Math.floor(Math.random() * array.length)
    for (var i = 0; i < array.length + 1; i++) {
        newArray.push(array[random])
        array.splice(random, 1)
        random = Math.floor(Math.random() * array.length)
        i = 0
    }
    return (newArray)
}

function renderBestGameForThisLevel() {
    var elBestGameTime = document.querySelector('.bestGameTime');
    var currTopTime = localStorage.getItem(gLevel.LEVEL_NAME)
    if (currTopTime + '' === 'null') {
        elBestGameTime.innerText = '00:00'
    }
    else {
        currTopTime = currTopTime.slice(0, 5)
        elBestGameTime.innerText = currTopTime;
    }
}

function storeBestGame() {
    var gameTime = Date.now() - gAbsolutStartedTime;
    var level = '';
    switch (gLevel.SIZE) {
        case 16: level = 'beginner';
            break;
        case 64: level = 'medium';
            break;
        case 144: level = 'expert';
            break;
    }
    var currTopTime = localStorage.getItem(level)
    if (currTopTime === null) { //if it's first game.
        localStorage.setItem(`${level}`, `${gMin10}${gMin01}:${gSec10}${gSec01} ${gameTime}`);
    } else {
        currTopTime = +currTopTime.slice(6)
        if (gameTime < currTopTime) {

            localStorage.setItem(`${level}`, `${gMin10}${gMin01}:${gSec10}${gSec01} ${gameTime}`);
            alert('It Was The Best Time For This Level!!! 💪🏾💪🏾💪🏾💪🏾')
        }
    }
}

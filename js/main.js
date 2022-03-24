'use strict'
const EMPTY = ' '
const MINE = '💣'
const FLAG = '🚩'
const WRONG = '❌'
const LIVE = '❤️'
const HINT = '💡'

var gTimeInterval

var gBoard

var gLevels = [{
    level: 1,
    size: 4,
    mines: 2
},
{
    level: 2,
    size: 8,
    mines: 12
},
{
    level: 3,
    size: 12,
    mines: 30
}
]

var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    minesLocation: [],
    selectedLevel: null,
    lives: 3,
    isHint: false,
    hintsCount: 3,
}

console.log(gGame.hintsCount)


function init(levelSelect = 0) {
    resetGame()
    var selectedValueIdx = (levelSelect) ? levelSelect.value : levelSelect
    gGame.selectedLevel = gLevels[selectedValueIdx]
    gBoard = createMat(gGame.selectedLevel.size, gGame.selectedLevel.size)
    updateLives()
    printMat(gBoard, '.table')
}

function printMat(mat, selector) {
    console.log('mat', mat);
    var strHTML = '<table border="1"><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j];
            var cellContent = cell.minesAroundCount
            var hide = ''
            if (cell.minesAroundCount === 0) cellContent = EMPTY
            if (cell.isMine === true) cellContent = MINE
            if (!cell.isShown) {
                if (cell.isMarked) {
                    cellContent = FLAG
                } else {
                    cellContent = EMPTY
                }
                var hide = ' hide'
            }
            if (!gGame.isOn) {
                console.log('game is over!');
                if (cell.isMarked) {
                    if (cell.isMine) {
                        cellContent = MINE
                    } else {
                        hide = ''
                        cellContent = WRONG
                    }
                }
            }
            var className = 'cell' + hide + ' cell-' + i + '-' + j;
            strHTML += '<td oncontextmenu="cellFlaged(event,this,' + i + ',' + j + ')" false  onclick="cellClicked(this,' + i + ',' + j + ');showNeighbors(' + i + ',' + j + ')" class="' + className + '"> ' + cellContent + ' </td>'
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;


}

function resetLevel() {
    var lastLevel = gGame.selectedLevel
    resetGame()
    gGame.selectedLevel = lastLevel
    gBoard = createMat(gGame.selectedLevel.size, gGame.selectedLevel.size)
    updateLives()
    printMat(gBoard, '.table')
}

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var negsCount = countNeighbors(i, j, gBoard)
            gBoard[i][j].minesAroundCount = negsCount
        }
    }
}

function placeMinesRandom(count) {
    for (var i = 0; i < count; i++) {
        var location = getEmptyCell(gBoard)
        gGame.minesLocation.push(location)
        gBoard[location.i][location.j].isMine = true
    }
}

function cellClicked(elCell, i, j) {
    if (gGame.isHint) return
    if (!gGame.isOn) return
    var cell = gBoard[i][j]
    if (cell.isShown) return
    if (cell.isMarked) return
    if (cell.isMine) {
        gGame.lives--
        updateLives()
        if (!gGame.lives) {
            gameOver({ i, j })
            return

        }
    }
    elCell.classList.remove('hide')
    cell.isShown = true
    gGame.shownCount++
    if (cell.minesAroundCount === 0) openEmptyCellsAroundInModel(gBoard, { i, j })
    printMat(gBoard, '.table')

    if (gGame.secsPassed === 0) {
        placeMinesRandom(gGame.selectedLevel.mines)
        setMinesNegsCount()
        printMat(gBoard, '.table')
        startTimer()
    }

    if (gGame.markedCount === gGame.selectedLevel.mines) checkVictory()
}

function cellFlaged(ev, elCell, i, j) {
    ev.preventDefault()
    if (gGame.isHint) return
    if (!gGame.isOn) return
    var cell = gBoard[i][j]
    if (cell.isShown) return
    cell.isMarked = !cell.isMarked
    if (cell.isMarked) {
        elCell.innerText = FLAG
        gGame.markedCount++
    } else {
        elCell.innerText = EMPTY
        gGame.markedCount--
    }
    if (gGame.markedCount === gGame.selectedLevel.mines) checkVictory()
}

function openEmptyCellsAroundInModel(mat, location) {
    for (var i = location.i - 1; i <= location.i + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (i === location.i && j === location.j) continue;
            if (j < 0 || j >= mat[i].length) continue;
            if (!mat[i][j].minesAroundCount && !mat[i][j].isMarked) {
                if (!mat[i][j].isShown) gGame.shownCount++
                mat[i][j].isShown = true
            }
        }
    }

}


function startTimer() {
    var timeStart = new Date()
    updateClock(timeStart)
    gTimeInterval = setInterval(updateClock, 1000, timeStart)
}

function updateClock(timeStart) {
    var elTimer = document.querySelector('.timer span')
    var timeNow = new Date()
    var timePass = new Date(timeNow - timeStart)
    var sec = timePass.getSeconds()
    var min = timePass.getMinutes()
    var time = min + ':' + sec
    elTimer.innerHTML = time
    gGame.secsPassed = time
}

function gameOver(pos) {
    var elIcon = document.querySelector('.icon button')
    elIcon.innerText = '🤯'
    console.log('game over');
    gGame.isOn = false
    revealMines()
    printMat(gBoard, '.table', elCell)
    var elCell = document.querySelector(getSelector(pos))
    elCell.classList.add('hit')
}

function checkVictory() {
    console.log('checking Victory');

    console.log('gGame.selectedLevel.size', gGame.selectedLevel.size);
    console.log('gGame.selectedLevel', gGame.selectedLevel.mines);
    console.log('gGame.shownCount', gGame.shownCount);
    if (gGame.shownCount === gGame.selectedLevel.size ** 2 - gGame.selectedLevel.mines) {
        var elIcon = document.querySelector('.icon button')
        elIcon.innerText = '😎'
    }
}

function revealMines() {
    for (var i = 0; i < gGame.minesLocation.length; i++) {
        var iIdx = gGame.minesLocation[i].i
        var jIdx = gGame.minesLocation[i].j
        gBoard[iIdx][jIdx].isShown = true
    }

}

function resetGame() {
    clearInterval(gTimeInterval)
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        minesLocation: [],
        selectedLevel: null,
        lives: 3,
        isHint: false,
        hintsCount: 3,
    }
}

function updateLives() {
    var elLives = document.querySelector('.lives span')
    var currentLives = gGame.lives
    // console.log('currentLives',currentLives);
    var strLives = ''
    switch (currentLives) {
        case 1: strLives = LIVE
            break
        case 2: strLives = LIVE + LIVE
            break
        case 3: strLives = LIVE + LIVE + LIVE
            break
    }
    elLives.innerHTML = strLives
    if (gGame.secsPassed) gGame.selectedLevel.mines--
    console.log('mines count', gGame.selectedLevel.mines);
}

function startHints(elBtnHints) {
    if (gGame.hintsCount) {
        gGame.hintsCount--
        gGame.isHint = true
        updateHints(elBtnHints)

    }
}


function updateHints(elBtn) {

    console.log('elbtn', elBtn);
    var span = elBtn.querySelector(`:nth-child(${gGame.hintsCount})`)
    console.log('btn', span);


    // var strHints = ''
    // switch (currentLives) {
    //     case 1: strHints = LIVE
    //         break
    //     case 2: strHints = LIVE + LIVE
    //         break
    //     case 3: strHints = LIVE + LIVE + LIVE
    //         break
    // }
    // gGame.hintsCount
    // elBtnHints.innerHTML
}


function showNeighbors(cellI, cellJ) {
    if (!gGame.isHint) return
    if (!gGame.isOn) return
    var neighbors = []
    gBoard[cellI][cellJ].isShown = true
    neighbors.push(gBoard[cellI][cellJ])
    console.log('selected hint', gBoard[cellI][cellJ]);
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= gBoard[i].length) continue
            var cell = gBoard[i][j]
            if (!cell.isShowen) {
                cell.isShown = true
                neighbors.push(cell)
            }
        }
    }
    printMat(gBoard, '.table')
    setTimeout(function () {
        for (var i = 0; i < neighbors.length; i++) {
            neighbors[i].isShown = false
        }
        printMat(gBoard, '.table')
    }, 400)
    gGame.isHint = false
}
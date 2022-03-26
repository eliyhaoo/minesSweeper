'use strict'
const EMPTY = ' '
const MINE = '💣'
const FLAG = '🚩'
const WRONG = '❌'
const LIVE = '❤️'
const HINT_ON_STR = '<span><img src="imgs/hint_on.png" alt=""></span>  <span><img src="imgs/hint_on.png" alt=""></span>  <span><img src="imgs/hint_on.png" alt=""></span>'
const HINT_OFF_STR = '<img src="imgs/hint_off.png" alt="">'

var gTimeInterval

var gBoard

var gBestScore = [{
    level: 1,
    bestTime: 100 + '.' + 100
},
{
    level: 2,
    bestTime: 100 + '.' + 100
},
{
    level: 3,
    bestTime: 100 + '.' + 100
}
]

var gLevels = [{
    level: 1,
    size: 4,
    mines: 2,
},
{
    level: 2,
    size: 8,
    mines: 12,
},
{
    level: 3,
    size: 12,
    mines: 30,
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




function init(levelSelect = 0) {
    resetGame()
    var copyOfgLevels = gLevels.slice()
    var selectedLevelIdx = (levelSelect) ? levelSelect.value : levelSelect
    gGame.selectedLevel = copyOfgLevels[selectedLevelIdx]
    gBoard = createMat(gGame.selectedLevel.size, gGame.selectedLevel.size)
    updateLives()
    printMat(gBoard, '.table')


    var elBestScore = document.querySelector('.bestScore span')
    if (gBestScore[selectedLevelIdx].bestTime === 100 + ':' + 100){
        elBestScore.innerText = 0 + ':' + 0
    }else  elBestScore.innerText = gBestScore[selectedLevelIdx].bestTime
    
}

function printMat(mat, selector) {
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
    if (cell.minesAroundCount === 0){
        openEmptyCellsAroundInModel(gBoard, { i, j })
        
    } 
    printMat(gBoard, '.table')

    if (gGame.secsPassed === 0) {
        startTimer()
        placeMinesRandom(gGame.selectedLevel.mines)
        setMinesNegsCount()
        printMat(gBoard, '.table')
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
            if (!mat[i][j].minesAroundCount && !mat[i][j].isMarked && !mat[i][j].isMine && !mat[i][j].isShown) {
                if (!mat[i][j].isShown) gGame.shownCount++
                mat[i][j].isShown = true
                if (gGame.secsPassed){
                    openEmptyCellsAroundInModel(mat,{i,j})
                    
                }
            }
        }
    }
   

}


function startTimer() {
    var timeStart = new Date()
    updateClock(timeStart)
    gTimeInterval = setInterval(updateClock, 100, timeStart)
}

function updateClock(timeStart) {
    var elTimer = document.querySelector('.timer span')
    var timeNow = new Date()
    var timePass = new Date(timeNow - timeStart)
    var sec = timePass.getSeconds()
    var min = timePass.getMinutes()
    var time = min + ':' + sec
    var timeForgGame = min + '.' + sec
    elTimer.innerHTML = time
    gGame.secsPassed = timeForgGame

}

function gameOver(pos) {
    clearInterval(gTimeInterval)
    var elIcon = document.querySelector('.icon button')
    elIcon.innerText = '🤯'
    gGame.isOn = false
    revealMines()
    printMat(gBoard, '.table', elCell)
    var elCell = document.querySelector(getSelector(pos))
    elCell.classList.add('hit')
}

function checkVictory() {
    if (gGame.shownCount === gGame.selectedLevel.size ** 2 - gGame.selectedLevel.mines) {
        clearInterval(gTimeInterval)
        checkBestScore()
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
    gLevels = [{
        level: 1,
        size: 4,
        mines: 2,
    },
    {
        level: 2,
        size: 8,
        mines: 12,
    },
    {
        level: 3,
        size: 12,
        mines: 30,
    }
    ]
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
    var elHintsBtn = document.querySelector('.hints button')
    elHintsBtn.innerHTML = HINT_ON_STR
    var elIcon = document.querySelector('.icon button')
    elIcon.innerText = '😋'




}

function resetLevel() {
    var lastLevel = gGame.selectedLevel
    var levelIdx = lastLevel.level - 1

    resetGame()
    lastLevel.mines = gLevels[levelIdx].mines
    gGame.selectedLevel = lastLevel
    gBoard = createMat(gGame.selectedLevel.size, gGame.selectedLevel.size)
    updateLives()
    printMat(gBoard, '.table')
}

function updateLives() {
    var elLives = document.querySelector('.lives span')
    var currentLives = gGame.lives
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
    if (gGame.secsPassed) {
        gGame.selectedLevel.mines--
    }
}

function startHints(elBtnHints) {
    if (gGame.hintsCount) {
        gGame.isHint = true
        updateHints(elBtnHints)

    }
}


function updateHints(elBtn) {
    var elHintsSpan = elBtn.querySelector(`:nth-child(${gGame.hintsCount})`)
    gGame.hintsCount--
    elHintsSpan.innerHTML = HINT_OFF_STR
}


function showNeighbors(cellI, cellJ) {
    if (!gGame.isHint) return
    if (!gGame.isOn) return
    var neighbors = []
    gBoard[cellI][cellJ].isShown = true
    neighbors.push(gBoard[cellI][cellJ])
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= gBoard[i].length) continue
            var cell = gBoard[i][j]
            if (!cell.isShown) {

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


function checkBestScore() {
    var selectedLevel = gGame.selectedLevel.level - 1
    if (gGame.secsPassed < gBestScore[selectedLevel].bestTime) {
        gBestScore[selectedLevel].bestTime = gGame.secsPassed
        var elBestScore = document.querySelector('.bestScore span')
        elBestScore.innerText = gBestScore[selectedLevel].bestTime
    }

}
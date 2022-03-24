'use strict'

// function printMat(mat, selector) {
//   console.log('mat',mat);
//   var strHTML = '<table border="1"><tbody>';
//   for (var i = 0; i < mat.length; i++) {
//     strHTML += '<tr>';
//     for (var j = 0; j < mat[0].length; j++) {
//       var cell = mat[i][j];
//       var cellContent = cell.minesAroundCount
//       var hide = ''
//       if (cell.minesAroundCount === 0) cellContent = EMPTY
//       if (cell.isMine === true) cellContent = MINE
//       if (!cell.isShown) {
//         if (cell.isMarked){
//           cellContent = FLAG
//         }else {
//           cellContent = EMPTY
//         }
//         var hide = ' hide'
//       }
//       if (!gGame.isOn){
//         console.log('game is over!');
//         if (cell.isMarked){
//           if (cell.isMine) {
//             cellContent = MINE
//           } else {
//             hide=''
//             cellContent = WRONG
//           }
//         }
//       }
//       var className = 'cell' + hide + ' cell-' + i + '-' + j;
//       strHTML += '<td oncontextmenu="cellFlaged(event,this,' + i + ',' + j + ')" false onclick="cellClicked(this,' + i + ',' + j + ')" class="' + className + '"> ' + cellContent + ' </td>'
//     }
//     strHTML += '</tr>'
//   }
//   strHTML += '</tbody></table>';
//   var elContainer = document.querySelector(selector);
//   elContainer.innerHTML = strHTML;
 

// }

// if (!gGame.isOn || !cell.isShown) {
//   if (cell.isMarked) {
//     if (gGame.isOn) {
//       cellContent = FLAG
//     } else {
//       if (cell.isMine) {
//         cellContent = MINE
//       } else cellContent = WRONG
//     }
//   } else {
//     cellContent = EMPTY
//   }
//   var hide = ' hide'
// }


function createMat(ROWS, COLS) {
  var mat = []
  for (var i = 0; i < ROWS; i++) {
    var row = []
    for (var j = 0; j < COLS; j++) {
      var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
      }
      row.push(cell)
    }
    mat.push(row)
  }
  return mat
}

// location such as: {i: 2, j: 7}
function renderCell(location, value,) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
  elCell.innerHTML = value;

}

// function renderCell(location, value) {
//   // Select the elCell and set the value
//   var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
//   elCell.innerHTML = value;
// }

// function changeColor(objects,color) {

//   for (var i = 0; i < gGhosts.length; i++) {
//     console.log(gGhosts[i].location)
//     var elCell = document.querySelector(getSelector(objects[i])) 
//     // elCell.style.color = color
//   }
// }

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getTime() {
  return new Date().toString().split(' ')[4];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

function countNeighbors(cellI, cellJ, mat) {
  var neighborsCount = 0;
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= mat.length) continue;
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (i === cellI && j === cellJ) continue;
      if (j < 0 || j >= mat[i].length) continue;

      if (mat[i][j].isMine === true) neighborsCount++;
    }
  }
  return neighborsCount;
}

function getCellCoord(strCellId) {
  var parts = strCellId.split('-')
  var coord = { i: +parts[1], j: +parts[2] };
  return coord;
}

function getSelector(coord) {
  return '.cell-' + coord.i + '-' + coord.j
}

function isEmptyCell(coord) {
  return gBoard[coord.i][coord.j] === ''
}

function findCells(mat, value = '') {
  var emptyCells = []
  for (var i = 0; i < mat.length; i++) {
    for (var j = 0; j < mat[0].length; j++) {
      var cell = mat[i][j]
      // var emptyCell = 
      // console.log('celsl', cell);
      console.log('loop cell', cell);

      if (cell === value) {
        emptyCells.push({ i, j })
      }
    }
  }
  if (emptyCells.length === 0) return false
  return emptyCells
}

function getEmptyCell(mat) {
  var emptyCells = []
  for (var i = 0; i < mat.length; i++) {
    for (var j = 0; j < mat[0].length; j++) {
      var cell = mat[i][j]
      if (!cell.isMine && !cell.isShown) {
        emptyCells.push({ i, j })
      }
    }
  }
  if (emptyCells.length === 0) return false
  var emptyCell = emptyCells[getRandomInt(0, emptyCells.length)]

  return emptyCell
}
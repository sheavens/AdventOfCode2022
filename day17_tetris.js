/* Find the height of a tower of blocks after 2022 blocks have fallen 
..this puzzle is based on Tetris game, where shapes fall until stopped by a shape
below.  Shapes can be moved left and right while falling to fit into gaps beneath.  In
this puzzle, the sequence moves left and roght are pre-determined in the input file.
Part 2 requires the tower height after 1000000000000 have fallen*/

"use strict"
// read an input file with promises
const fs = require("fs").promises;
const assert = require('assert');
const { repeat } = require("lodash");

const readlines = async() => {
    const data = await fs.readFile('day17_input.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    //const blankLine = /\r\n\r\n|\r\r|\n\n/
    //return data.split(blankLine).map(e => e.split(newLine)) 
    return data.replace(/(?:\\[rn]|[\r\n]+)+/g, "").split('')
};

// utility functions
const union = (setA, setB) => new Set([...setA, ...setB])

const strPt = (str) => str.split('_').map(p => Number(p))
const ptStr = (pt) => pt.join('_')
const ptSet = (ptArr) => new Set(ptArr.map(p => ptStr(p)))
const ptArr = (ptSet) => Array.from(ptSet).map(p => strPt(p))

function samePts(a, b) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.flat().every((val, index) => val === b.flat()[index]); // flatten pt arrays
}

const maxCol = (ptsArr = [[4,3],[5,10]]) => Math.max(...ptsArr.map(p => +p[0])) 
const minRow = (ptsArr = [[4,3],[5,10]]) => Math.min(...ptsArr.map(p => +p[1])) 
const below = ([x,y]) => [x,y+1]

const reduceFilledSet = (filledSet, walls) => {
  // remove all filled cells below a complete layer, and deep enough to not be affected by falling shapes
  let completeLayer
  let filledArr = ptArr(filledSet)
  const highestFilled = Math.min(...(filledArr.map(e => e[1]))) // highest is most negative row
  // drop everything more than 1100 from the top - unlikely to fall below this by this stage (moves repeats 1091)
  filledArr = filledArr.filter(e => e[1] < highestFilled + 1100)
  for (let layer = highestFilled; layer < 0; layer++) {
    if ((filledArr.filter(e => e[1] === layer)).length === walls.right - walls.left -1) {
      completeLayer = layer
      filledArr = filledArr.filter(e => e[1] <= completeLayer)
      break
    }
  }
  return ptSet(filledArr)
}


const printGrid = (stringPointSet,shapeSet) => {
  let printLine = ''
  const gridPoints = [...union(stringPointSet,shapeSet)].map(s => strPt(s))
  const grid = { width: maxCol(gridPoints), height: minRow(gridPoints), values: gridPoints}  // height -ve here
  for (let row = grid.height; row < 1 ; row++) {   // height and rows here are negative
    printLine = ''
    for (let col = 0; col < 9; col++) { // print from wall 0 to wall 8
      if (col === 0 || col === 8) { 
        printLine = printLine + '|'
      } else if (row === 0) {
        printLine = printLine + '_' 
      } else if (stringPointSet.has(ptStr([+col,+row]))) {
        printLine = printLine + "#"
      } else if (shapeSet.has(ptStr([+col,+row]))) {
        printLine = printLine + "@"
      } else {
        printLine = printLine + "."
      }
    }
    console.log(printLine)
  }
}

const filterCol = (arr = [[1,2],[3,4]], col = 4) => arr.filter(p => p[0] === col)
assert(samePts(filterCol([[2,3],[1,3]], 4),[]), 'filterCol test 1')

const filterRow = (arr = [[1,2],[3,4]], row = 4) => arr.filter(p => p[1] === row)
assert(filterRow([[2,3],[1,3]], 4).length === 0, 'filterRow test 1')

const atFloor = (ptArr) => filterRow(ptArr, -1).length> 0 ? true : false

const west = (p = [1,2]) => [p[0]-1,p[1]]// moves coords
assert(samePts(west([2,3]),[1,3]), 'west test 1')

const east = (p = [1,2]) => [p[0]+1,p[1]]// moves coords
assert(samePts(east([2,3]),[3,3]), 'east test 1')

const down = (p = [1,2]) => [p[0],p[1]+1]// moves coords
assert(samePts(down([2,3]),[2,4]), 'down test 1')


/* Functions that move a set of points (as 'col_row' strings),
  when this does not result in a collsion with a filledSet cell or the row/column
  of a wall */ 

const moveInDir = (ptArr, filledSet, walls, fnDirection = west) => {
// if not colliding with wall row/col, or filled cell, move using fnDirection
    const newPtArr = ptArr.map(s => fnDirection(s))
    if (filterCol(newPtArr, walls.right).length> 0) return ptArr // Would collide with wall, don't move
    if (filterCol(newPtArr, walls.left).length> 0) return ptArr // Would collide with wall, don't move
    if (filterRow(newPtArr, walls.floor).length> 0) return ptArr // Would collide with floor, don't move
    const newPtSet = ptSet(newPtArr)
    return union(newPtSet, filledSet).size <  newPtSet.size + filledSet.size ? ptArr : newPtArr  // If collison with filled cell, don't move
}
const moveLeft = (ptArr, filledSet, walls) => moveInDir(ptArr, filledSet, walls, west) 
const moveRight = (ptArr, filledSet, walls) => moveInDir(ptArr, filledSet, walls, east) 
const moveDown = (ptArr, filledSet, walls) => moveInDir(ptArr, filledSet, walls, down) 

// tests
let testptArr = [[1,-2],[8,-2,]]
let testFilledSet = ptSet([[5,-6],[7,-8]])
let walls = {left:0, right:8, floor:0}    // Note floor at y 0  - is y increasing upwards, or negative?
// if ptArr after move contains a point in the wall (x value of left or right wall), strPtsSet unchanged
assert(samePts(testptArr, moveLeft(testptArr, testFilledSet, walls)), 'moveLeft test 1')  
testptArr = [[4,-2],[8,-2]]
assert(!samePts(testptArr, moveLeft(testptArr, testFilledSet, walls)), 'moveLeft test 2') 
// moved ptArr contains a point in the filled Set, strPtsSet unchanged
testptArr = [[1,-2],[2,-8],[4,-6]]
assert(samePts(testptArr, moveRight(testptArr, testFilledSet, walls)), 'moveRight test 1')
// moved ptArr contains a point in the floor (y value), strPtsSet unchanged
testptArr = [[2,-1],[1,-2],[3,-4]]
assert(samePts(testptArr, moveDown(testptArr, testFilledSet, walls)), 'moveDown test 1')

const moveShape = (shape, move) => shape.map(e =>  [e[0]+move[0], e[1]+move[1]] )


/* Main function to play the game
!! Note that the returned fall function contains the current game state (i.e the filledSet of cells) ..
.. so this function is not pure, but is a closure over the game state.  Calling it again always starts
from the previous game state. */
const play = (moves, walls, shapeList) => { // constants as parameters
  let index = 0  // game state variables stored in closure
  let minY = 0
  let filledSet = new Set()
  let rock = 0
  let shape
  
  const fall = (printIt=false) => { // tracks fall of one shape, updates game state
    if (printIt) printGrid(filledSet, ptSet(shape))
    // get next rock shape
    shape = shapeList[rock % shapeList.length]
    // set at start position : left edge is 2 units from left wall bottom 3 units from floor
    shape = moveShape(shape, [3, minY - 4]) // minY -ve , distance from floor at 0
    let moveCount = 0
    let stopped = false
    // move left or right
    if (index === moves.length) index = 0
    shape = moves[index] === '<' ? moveLeft(shape, filledSet, walls) : moveRight(shape, filledSet, walls)
    moveCount = moveCount+1
    index += 1
    //printGrid(filledSet, ptSet(shape))
    while (!stopped) {
      // move down
      shape = moveDown(shape, filledSet, walls)
      //printGrid(filledSet, ptSet(shape))
      // move left or right
      if (index === moves.length) index = 0
      shape = moves[index] === '<' ? moveLeft(shape, filledSet, walls) : moveRight(shape, filledSet, walls)
      index += 1
      moveCount = moveCount+1
      //printGrid(filledSet, ptSet(shape))
      // check for stopped
      if (filledNeighboursBelow(shape, filledSet) || atFloor(shape)) {
        stopped = true
        if (topShape(shape) < minY) minY = topShape(shape) 
        filledSet = union(filledSet, ptSet(shape)) 
        if (filledSet.size > 2500) filledSet = reduceFilledSet(filledSet, walls) // drop out all lines below a filled line to keep the size of the filled set small
      }
    }
    rock +=1
    return -1*minY// return the maximum height  ( -ve minY as row up from floor at 0)
  }
  return fall
}


// initialise shapes: left point at col 0, bottom at row 0
const linePts = [[0,0],[1,0],[2,0],[3,0]]
const crossPts = [[1,-1],[1,-2],[1,0],[2,-1],[0,-1]]
const LPts = [[0,0],[1,0],[2,0],[2,-1],[2,-2]]
const vLinePts = [[0,0],[0,-1],[0,-2],[0,-3]]
const squarePts = [[0,0],[1,0],[0,-1],[1,-1]]

const topShape = (shape) => {
  // returns smallest y value (highest point) from a set of points as strings
    return Math.min(...shape.map(s => Number(s[1])))
  }
  assert(topShape(linePts) === 0, 'topShape test 1')
  assert(topShape(crossPts) === -2, 'topShape test 2')

const filledNeighboursBelow = (pts, filledSet) => {
  // returns true if points below the shape are in the filled set
    const neighboursBelow = 
      pts.map(p=>below(p)).filter(p => !pts.includes(p)) // filter out points part of shape
    const belowSet = ptSet(neighboursBelow)
    return union(filledSet,belowSet).size < filledSet.size + belowSet.size
  }
  assert(filledNeighboursBelow(crossPts, linePts) === false, 'test filledNeigbours below 1')

// Part 1 requires the height of the tower after 2022 blocks have fallen
const solveIt  = async() => {
  const moves = await readlines()
  const shapeList = [linePts,crossPts,LPts,vLinePts,squarePts]
  const walls = {left:0, right:8, floor:0}
  //const moves = '>>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>'.split('') //
  const rockFall = play(moves, walls, shapeList)
  let towerHeight = 0
  for (let rock = 0; rock < 2022; rock++) {
    towerHeight = rockFall()
  }
  return 'Part 1 ' + towerHeight
}
solveIt().then(console.log)


// functions to test for repeats in an array
const repeatsOver = (array, n, from=0) => {
  // Return true if an array immediately repeats n entries, starting from 'from' index
  if (array.length < 2 * n) return false  // if the  array is not at least 2*n long, it is not long enough for a repeat
  return samePts(array.slice(from, from+n), array.slice(from+n,from+2*n))  
}
// tests for repeatsOver
assert(repeatsOver(['A','B','C','A','B','C'], 3)===true, 'test for repeatsOver 3 true')
assert(repeatsOver(['A','B','D','A','B','C'], 3)===false, 'test for repeatsOver 3 false')
assert(repeatsOver(['A','B','C','A','B','C'], 3, 1)===false, 'test for repeatsOver from 1 false')

const repeatsAfter = (array, n, from=0, next=from+n) => {
  // Return true if an array repeats n entries from 'from' index, at 'to' index
  // allow overlapping repeats ...abababab repeats 3 chars bab at 1 and 3 or ab at 0 and 2
  if (array.length < next+n) return false  // array must be long enough to contain sequence beteen 'from' and 'to' and repeat at 'to' index
  return samePts(array.slice(from, from+n), array.slice(next,next+n))  
}
// tests for repeatsAfter
assert(repeatsAfter(['A','B','C','A','B','C'], 3)===true, 'test for repeatsAfter, 1 repeat')
assert(repeatsAfter(['A','B','D','A','B','C'], 2, 0, 3)===true, 'test for repeatsAfter, repeats after 1 skipped char')
assert(repeatsAfter(['A','B','D','A','B','C'], 3, 0, 3)===false, 'test for repeatsAfter, 0 repeats')
assert(repeatsAfter(['A','B','A','B','A','B'], 3, 1, 3)===true, 'test for repeatsAfter, repeats with overlap')
assert(repeatsAfter(['A','B','A','B','D','B'], 2, 0, 2)===true, 'test for repeatsAfter, true for 1 repeat')

const repeatsEvery = (array, n, from=0, next=from+n) => {
  // Return true if an array repeats n entries over and over again starting at 'from' index
  // allow partial repeat at the end of the array
  if (!repeatsAfter(array, n, from, next)) return false
  return array.slice(from+n).length < 2*n ? true : repeatsEvery(array.slice(from+n), n, 0, n) //if fewer entries left for another repeat, and repeatAfter did not return false, the next repeat was started.
}
// tests for repeatsEvery
assert(repeatsEvery(['A','B','C','A','B','C','A','B','C'], 3)===true, 'test for repeatsEvery, 3 repeats')
assert(repeatsEvery(['A','B','C','A','B','C','A','B','D'], 3)===false, 'test for repeatsEvery, 2 repeats only')
assert(repeatsEvery(['F','G','H','A','B','A','B','A'], 2, 3)===true, 'test for repeatsEvery, starts at 3')
assert(repeatsEvery(['A','B','A','B','A','B','A'], 3, 1, 3)===true, 'test for repeatsEvery, repeats with overlap')

// function returns the new total height of the tower after a further rocksToFall rocks have fallen
const height = (rockFall, rocksToFall) => {
  let h = 0
  for (let rock = 0; rock < rocksToFall; rock++) {
    h = rockFall()
  }
  return h
}

// function that adds array values
const sum = (arr) => arr.reduce((a,b) => a+b, 0)

// Part 2 requires the height of the tower after 1000000000000 rocks have fallen 
// .. look for a repeating pattern
const solveItPart2  = async() => {
  const moves = await readlines()
  const shapeList = [linePts,crossPts,LPts,vLinePts,squarePts]
  const walls = {left:0, right:8, floor:0}
  //const moves = '>>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>'.split('') //
  const rockFall = play(moves, walls, shapeList)
  //let rocksToFall = 10000
  let rocksToFall = 1000000000000
  let towerHeight,  lastTowerHeight = 0
  let delta = []
  let repeatHeight, repeats, rocksOver
  let rockNum
  let startRocks = 20*shapeList.length // a number of rocks to allow to fall before looking for repeat patterns - to allow pattern to stablise from start at the floor
  towerHeight = height(rockFall, startRocks) 
  rockNum = startRocks
  // find the number of rocks over which height increases by a repeat, constant amount
  // !! this is flakey method, can get 1 repeats early, depending on startRocks (should look for more)
  let repeated = false
  while (!repeated && rockNum < 5000) {  // stop when a repeated pattern found. rocknum limit for testing; should find a repeat before this
    lastTowerHeight = towerHeight
    // calculate the tower height after an additional set of 'shapeList' rocks has fallen
    towerHeight = height(rockFall, 1*shapeList.length)
    if (rockNum > startRocks) delta.push(towerHeight - lastTowerHeight) // store the increase in tower height for this set of rock shapes
    rockNum += shapeList.length
    if (delta.length > 0 && delta.length % 2 === 0) repeated = repeatsEvery(delta, Math.floor(delta.length/2))
  }
  // calc. the number of repeats of the pattern in the total number of rocks to fall, after rocks already fallen
  repeats = repeated ? Math.floor((rocksToFall - rockNum)/(delta.length/2*shapeList.length)) : 0
  // calc. the number of rocks over after the last repeated pattern
  rocksOver = repeated ? (rocksToFall - rockNum) % (delta.length/2*shapeList.length) :  rocksToFall - rockNum
  towerHeight = height(rockFall, rocksOver)  
  repeatHeight = sum(delta.slice(0, Math.floor(delta.length/2)))
  // calc. the final tower height adding a multiple of the repeat height
  towerHeight = towerHeight + repeatHeight * repeats
  return 'Part 2 ' + towerHeight
}

solveItPart2().then(console.log)

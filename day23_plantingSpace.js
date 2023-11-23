/* Follow given rules to move elves from thier initial grid positions, moving one place N S E or W in
each round, or not moving at all. This has the effect of speading them out.  
The rules are:
Each elf proposes its next move at the same time.  It can propose to move N if there are no other
elves to the NW, N or NE (and similarly for proposing moving S, W, E).  
In the first round, each elf will test for moving N first, then S, then W, then E.  In the second round, 
each elf will test for moving S first, (then W, then E, then N), and cycling round to start testing 
in the next of the 4 directions in the each round. 
Then the elves move..However, no move is made if all adjacent spaces are empty, or another elf has 
proposed moving to the same place, or no move was possible under the rules */ 

"use strict"

// read an input file with promises
const fs = require("fs").promises;
const assert = require('assert')
const _ = require("lodash")

const readlines = async() => {
    const data = await fs.readFile('day23_input.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    //const blankLine = /\r\n\r\n|\r\r|\n\n/
    //return data.split(blankLine).map(e => e.split(newLine)) 
    return data.split(newLine).map(e=>e.split(''))
};

const test = [
'....#..',
'..###.#',
'#...#.#',
'.#...##',
'#.###..',
'##.#.##',
'.#..#..',
]


const testInput = test.map(e=>e.split(''))

const stringToPair = (string = "4_3") => string.split("_").map(e=>+e)
const pointAsString = ([col,row]) => col.toString()+'_'+row  //To Do add to grid useful func file
const maxCol = (pairs) => pairs.map(p => +p[0]).reduce((a,b) => a < b ? b : a)
const maxRow = (pairs= [[4,3],[5,10]]) => pairs.map(p => +p[1]).reduce((a,b) => a < b ? b : a)
const minCol = (pairs) => pairs.map(p => +p[0]).reduce((a,b) => a > b ? b : a)
const minRow = (pairs= [[4,3],[5,10]]) => pairs.map(p => +p[1]).reduce((a,b) => a > b ? b : a)

const printGrid = (stringPointSet) => {
  let printLine = []
  const gridPoints = [...stringPointSet].map(s => stringToPair(s))
  //const grid = { width: maxCol(gridPoints)-minCol(gridPoints)+1, height: maxRow(gridPoints)-minRow(gridPoints)+1, values: gridPoints}
  for (let row = minRow(gridPoints); row < maxRow(gridPoints) + 1; row++) {  // grid cordinates can be -ve
    printLine = []
    for (let col = minCol(gridPoints); col < maxCol(gridPoints) + 1; col++) {
      stringPointSet.has(pointAsString([+col,+row])) ?

        printLine = printLine + "#" : printLine = printLine + "."
        if (stringPointSet.has(pointAsString([+col,+row]))) {
          stringPointSet.delete(pointAsString([+col,+row]))
        } 
    }
    // console.log(stringPointSet)
    console.log(printLine)
  }
}

const max = (arr) => arr.reduce((a,b) => a>b ? a : b, a)
const maxKey = (arrObjects, key) => max(arrObjects.map(e=>e[key])) // the maximum of values with this key

const count = (arr, v) => arr.reduce((a,b) => JSON.stringify(b)==JSON.stringify(v) ? a+1 : a, 0)
//console.log(count(['s','s','u','y','t'],'s'))

const filteredMap = (map, value) => new Map([...map].filter(([k, v]) => v === value))  // trick to filter a Map (convert to array of [k, v] pairs, filter, make new Map)

// Test for arrays with equal values (arrays are reference types so === fails)
function arrayEquals(a, b) {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index]);
  }

const intersection = (setA, setB) => {
    // rerurn set that are in both input sets
    return new Set([...setA].filter(x => setB.has(x)))
}

// uses grid object in form {width:, height: ,values:[row][col]}
// points in form {x: , y: ,  value}

const north = (pt, grid) => pt.y === 0 ? null : {x: pt.x, y: pt.y - 1, value: grid.values[pt.y - 1][pt.x]}
const south = (pt, grid) => pt.y === grid.height-1 ? null : {x: pt.x, y: pt.y + 1, value: grid.values[pt.y + 1][pt.x]}
const east = (pt, grid) => pt.x ===  grid.width-1 ? null : {x: pt.x + 1, y: pt.y, value: grid.values[pt.y][pt.x + 1]}
const west = (pt, grid) => pt.x === 0 ? null : {x: pt.x - 1, y: pt.y, value: grid.values[pt.y][pt.x - 1]}
const northEast = (pt, grid) => pt.y === 0 || pt.x ===  grid.width-1 ? null : {x: pt.x + 1, y: pt.y - 1, value: grid.values[pt.y - 1][pt.x + 1]}
const southEast = (pt, grid) => pt.y === grid.height-1 || pt.x ===  grid.width-1 ? null : {x: pt.x + 1, y: pt.y + 1, value: grid.values[pt.y + 1][pt.x + 1]}
const northWest = (pt, grid) => pt.y === 0 || pt.x ===  0 ? null : {x: pt.x - 1, y: pt.y - 1, value: grid.values[pt.y - 1][pt.x - 1]}
const southWest = (pt, grid) => pt.y === grid.height-1 || pt.x ===  0 ? null : {x: pt.x - 1, y: pt.y + 1, value: grid.values[pt.y + 1][pt.x - 1]}

// for use with an infinite; returns point co-ordinates which may be beyond any alreay used.  
//unbounded grid - no width or height limits just Map of point values indexed by pt onject {x: y:}

const n = (pt) => ({x: pt.x, y: pt.y - 1})
const s = (pt) => ({x: pt.x, y: pt.y + 1})
const e = (pt) => ({x: pt.x + 1, y: pt.y})
const w = (pt) => ({x: pt.x - 1, y: pt.y})
const ne = (pt) => ({x: pt.x + 1, y: pt.y - 1})
const se = (pt) => ({x: pt.x + 1, y: pt.y + 1})
const nw = (pt) => ({x: pt.x - 1, y: pt.y - 1})
const sw = (pt) => ({x: pt.x - 1, y: pt.y + 1})

const neighbours = (ptStr='4_5') => {
    // storing points as strings instead
    const ptArr = ptStr.split('_').map(e=>+e)
    return ({
        n:ptArr[0]+'_'+(ptArr[1]-1),
        s:ptArr[0]+'_'+(ptArr[1] + 1),
        e:(ptArr[0]+ 1)+'_'+(ptArr[1]),
        w:(ptArr[0]- 1)+'_'+(ptArr[1]),
        ne:(ptArr[0]+ 1)+'_'+(ptArr[1] - 1),
        se:(ptArr[0]+ 1)+'_'+(ptArr[1] + 1),
        nw:(ptArr[0]- 1)+'_'+(ptArr[1] - 1),
        sw:(ptArr[0]- 1)+'_'+(ptArr[1] + 1),
    })
}

const neighbourSet = (ptStr='4_5') => {
// return a set of the 8 grid neighbours of a point, 
// as strings of form '4_6'
    const ptArr = ptStr.split('_').map(e=>+e)
    return (new Set([
        ptArr[0]+'_'+(ptArr[1]-1),
        ptArr[0]+'_'+(ptArr[1] + 1),
        (ptArr[0]+ 1)+'_'+(ptArr[1]),
        (ptArr[0]- 1)+'_'+(ptArr[1]),
        (ptArr[0]+ 1)+'_'+(ptArr[1] - 1),
        (ptArr[0]+ 1)+'_'+(ptArr[1] + 1),
        (ptArr[0]- 1)+'_'+(ptArr[1] - 1),
        (ptArr[0]- 1)+'_'+(ptArr[1] + 1),
    ]))
}

const moveNorth = (to, ptArr) => !(ptArr.some(el => _.isEqual(el, to.n) ||  ptArr.some(el => _.isEqual(el, to.ne)) || ptArr.some(el => _.isEqual(el,to.nw)))) 
const moveSouth = (to, ptArr) => !(ptArr.some(el => _.isEqual(el,to.s)) ||  ptArr.some(el => _.isEqual(el,to.se)) || ptArr.some(el => _.isEqual(el,to.sw))) 
const moveWest =  (to, ptArr) => !(ptArr.some(el => _.isEqual(el,to.w)) ||  ptArr.some(el => _.isEqual(el,to.nw)) || ptArr.some(el => _.isEqual(el,to.sw))) 
const moveEast =  (to, ptArr) => !(ptArr.some(el => _.isEqual(el,to.e)) ||  ptArr.some(el => _.isEqual(el,to.ne)) || ptArr.some(el => _.isEqual(el,to.se))) 

const stay = (to, ptArr) => {
    return !(ptArr.some(el => _.isEqual(el, to.n)) || ptArr.some(el => _.isEqual(el, to.s)) 
            || ptArr.some(el => _.isEqual(el, to.w)) || ptArr.some(el => _.isEqual(el, to.e)) 
            || ptArr.some(el => _.isEqual(el, to.ne)) || ptArr.some(el => _.isEqual(el, to.nw)) 
            || ptArr.some(el => _.isEqual(el, to.se)) || ptArr.some(el => _.isEqual(el, to.sw)))
}

// changed to ptSet from ptArr, for faster lookup
const move = (toArr, ptSet) => { 
    // returns true if none of the points in toArr are in the ptSet
    return !(toArr.some(el => ptSet.has(el)))
}

const goTo = (pt, ptSet, moveNumber)  => {
    const to = neighbours(pt)
    const moveNorth = move([to.n,to.ne,to.nw], ptSet)
    const moveSouth = move([to.s,to.se,to.sw], ptSet)
    const moveWest = move([to.w,to.nw,to.sw], ptSet)
    const moveEast = move([to.e,to.ne,to.se], ptSet)
    if (moveNorth && moveSouth && moveWest && moveEast) return pt // all moves are possible - stay put
    if (moveNumber % 4 === 0) return moveNorth ? to.n : moveSouth ? to.s : moveWest ? to.w : moveEast ? to.e : pt
    if (moveNumber % 4 === 1) return moveSouth ? to.s : moveWest ? to.w : moveEast ? to.e : moveNorth ? to.n : pt
    if (moveNumber % 4 === 2) return moveWest ? to.w : moveEast ? to.e : moveNorth ? to.n : moveSouth ? to.s : pt
    if (moveNumber % 4 === 3) return moveEast ? to.e : moveNorth ? to.n : moveSouth ? to.s : moveWest ? to.w: pt
}

// Part 1.  Find the number of grid cells in the smallest bounding rectangle 
// containing all the elves after 10 moves
const solveIt  = async() => {
    let grid = await readlines()
    //let grid = testInput
    let ptMap = new Map()
    let ptArr = new Array()
    grid.map((row,rowNum)=>row.map((col,colNum)=>(ptMap.set(colNum+'_'+rowNum, grid[rowNum][colNum])))) // grid, stored as [[rowValue][columnValue]] to array of strings
    let newArr = new Array()
    let ptSet = new Set()
    
    // ToDo - add to useful functions
    ptMap = new Map([...ptMap].filter(([k, v]) => v === '#'))  // trick to filter a Map (convert to array of [k, v] paird, filter, make new Map)
    // no longer need to use the '#' symbol - the pointmap containsthe co-ordinates of the points of interest here - continue with array of points
    ptArr = [...ptMap].map(([k, v]) => k)

    let proposedMoves = new Array()
    let moveNumber = 0
    let moved = true
    while (moveNumber < 10 && moved) {
        // change to Array to Set for fast lookup
        ptSet = new Set(ptArr)
        proposedMoves = ptArr.map(pt =>goTo(pt, ptSet, moveNumber))
        for (let i = 0; i < proposedMoves.length; i++) {
            newArr.push(count(proposedMoves, proposedMoves[i]) > 1 ? ptArr[i] : proposedMoves[i])
        }
        if (_.isEqual(newArr, ptArr)) moved = false 
        ptArr = [...newArr] 
        newArr = []
        moveNumber = moveNumber + 1   
        console.log('step: ' , moveNumber)
        //printGrid(new Set(ptArr))
    }
    const ptPairs = ptArr.map(s => stringToPair(s))
    // Calculate the number of empty tiles in the smallest bounding rectangle
    return 'Part 1 ' + ((maxRow(ptPairs)-minRow(ptPairs) + 1)*(maxCol(ptPairs)-minCol(ptPairs) + 1)-ptPairs.length)
}
solveIt().then(console.log)

// Part 2.  Find the first round at which no moves are made
const solveItPart2  = async() => {
// This code works as for Part 1, but is much too slow for Part 2, which requires hundreds of rounds
// ..algorithm improved in solveItPart22 below
    let grid = await readlines()
    //let grid = testInput
    let ptMap = new Map()
    let ptArr = new Array()
    let ptSet = new Set()
    grid.map((row,rowNum)=>row.map((col,colNum)=>(ptMap.set(colNum+'_'+rowNum, grid[rowNum][colNum])))) // grid, stored as [[rowValue][columnValue]] to array of strings
    let newArr = new Array()
    ptArr = [...ptMap].filter(([k, v]) => v === '#').map(([k, v]) => k) // no longer need to use the '#' symbol - the pointmap containsthe co-ordinates of the points

    let proposedMoves = new Array()
    let moveNumber = 0
    let moved = true
    while (moved) {
        // change to Array to Set for fast lookup
        ptSet = new Set(ptArr)
        proposedMoves = ptArr.map(pt =>goTo(pt, ptSet, moveNumber))
        for (let i = 0; i < proposedMoves.length; i++) {
            newArr.push(count(proposedMoves, proposedMoves[i]) > 1 ? ptArr[i] : proposedMoves[i])
        }
        if (_.isEqual(newArr, ptArr)) moved = false 
        ptArr = [...newArr] 
        newArr = []
        moveNumber = moveNumber + 1   
        if(moveNumber % 10 === 0) console.log('step: ' , moveNumber)
        //printGrid(new Set(ptArr))
    }
    return 'Part 2 ' + moveNumber
}
//solveItPart2().then(console.log)

const solveItPart22  = async() => {
    // New algoritm reduces number of elves to process at each round
    // .. by only processing those elves which are adjacent to other elves, so could move
    // The program speeds up in later rounds as the number of isolated elves (not processed) increases
        let grid = await readlines()
        //let grid = testInput
        let ptMap = new Map()
        grid.map((row,rowNum)=>row.map((col,colNum)=>(ptMap.set(colNum+'_'+rowNum, grid[rowNum][colNum])))) // grid, stored as [[rowValue][columnValue]] to array of strings
        let ptArr = [...ptMap].filter(([k, v]) => v === '#').map(([k, v]) => k)// no longer need to use the '#' symbol - the pointmap containsthe co-ordinates of the points
        let ptSet = new Set()
        let elvesWithNeighbours = new Array()
        let isolatedElves = new Array()   
        let newArr = new Array()
        let proposedMoves = new Array()
        let moveNumber = 0
        let moved = true

        while (moved) {
            ptSet = new Set(ptArr)
            // filter out isolated elves - those with no adjacent elves
            isolatedElves = ptArr.filter(pt => intersection(neighbourSet(pt),ptSet).size === 0)
            //console.log('isolated elves: ', isolatedElves.length)
            elvesWithNeighbours = ptArr.filter(pt => intersection(neighbourSet(pt),ptSet).size != 0)
            // only process those elves with neighbours; others will not move
            proposedMoves = elvesWithNeighbours.map(pt =>goTo(pt, ptSet, moveNumber))
            for (let i = 0; i < proposedMoves.length; i++) {
                newArr.push(count(proposedMoves, proposedMoves[i]) > 1 ? elvesWithNeighbours[i] : proposedMoves[i])
            }
            if (_.isEqual(newArr, elvesWithNeighbours)) moved = false 
            // add back the previously isolated elves ..they may no longer be isolated
            ptArr = [...newArr, ...isolatedElves]
            newArr = []
            moveNumber = moveNumber + 1   
            if(moveNumber % 10 === 0) console.log('step: ' , moveNumber)
            //printGrid(new Set(ptArr))
        }
        return 'Part 2 ' + moveNumber
    }
    //980
    
    solveItPart22().then(console.log)
// read an input file with promises
const fs = require("fs").promises
const assert = require('assert')

const readlines = async() => {
    const data = await fs.readFile('day8_input.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    //const blankLine = /\r\n\r\n|\r\r|\n\n/
    //return data.split(blankLine).map(e => e.split(newLine)) 
    return data.split(newLine).map(e => e.split('')) 

};

const rawInput = [
'30373',
'25512',
'65332',
'33549',
'35390',
]

const testInput = rawInput
        .map(d => d.split('\n'))  // array split at newlines
        .map(d => d.map(e => e.split(''))).flat()   // separate characters with commas 

// grid functions
//ToDo !!! changed to simply grid.flat()
const flatGrid = (gridArr) => {
    /*  store a grid input as a 2-D array as an object
        input: a 2-D matrix of grid values - strings expected 
        output: object containing 1-D array of values with grid width and height  */
    return { width: gridArr[0].length, height: gridArr.length, values: gridArr.flat() }
}
console.log('flatGrid ', flatGrid(testInput))
// return an array of data in row rowNumber, from a flatGrid object
const row = (flatGrid, rowNumber) => flatGrid.values.join('').slice(rowNumber * flatGrid.width, flatGrid.width * (rowNumber + 1)).split('')
// return an array of data in column colNumber, from a flatGrid object
const col = (flatGrid, colNumber) => flatGrid.values.filter((e, i) => (i % flatGrid.width) === colNumber)

const getRows = (flatGrid) => {
    // return the rows of a flatGrid object, as a 2-D array
    let rows = []
    for (let r = 0; r < flatGrid.width; r++) {
        rows.push(row(flatGrid, r))
    }
    return rows
}// ToDO !!! error correctedc in getColumns .. changed to .width for columns - change in function set and chcekv getRows
const getColumns = (flatGrid) => {
    // return the columns of a flatGrid object, as a 2-D array    
    let cols = []
    for (let c = 0; c < flatGrid.width; c++) {
        cols.push(col(flatGrid, c))
    }
    return cols
}

const pt = (col,row) => ([col, row]) // chose array form because array functions used
const ptToString = ([col, row]) => col.toString() + "_" + row.toString()

const getPtMap = (flatGrid) => {
// store col, row as string 'col_row' for key in a Map, with the value as the entry
    const ptMap = new Map()
    let index = 0
    for (let row = 0; row < flatGrid.height; row++) {
        for (let col = 0; col < flatGrid.width; col++) {
            ptMap.set(ptToString(pt(col, row)), flatGrid.values[index])
            index = index + 1
        }
    }
    return ptMap
}

const testPtMap = getPtMap(flatGrid(testInput))
assert(testPtMap.get('4_4') === '0', 'grid 4_4 value is 0')
assert(testPtMap.get('0_2') === '6', 'grid 0_2 value is 6')
//console.log( 'testMap ', getPtMap(flatGrid(testInput)))



const getNorthPt = ([col, row]) =>  [col, row-1].join('_')
const getSouthPt = ([col, row])  => [col, row+1].join('_')
const getEastPt = ([col, row])  =>  [col+1, row].join('_')
const getWestPt = ([col, row])  =>  [col-1, row].join('_')

const getPt = (fromPt, direction = 'N') => {
// fromPt stored as strings col_row
    if (direction === 'N') return getNorthPt(fromPt.split('_').map(e => Number(e)))
    if (direction === 'S') return getSouthPt(fromPt.split('_').map(e => Number(e)))
    if (direction === 'E') return getEastPt(fromPt.split('_').map(e => Number(e)))
    if (direction === 'W') return getWestPt(fromPt.split('_').map(e => Number(e)))
}

const getPtsInDirection = (startPt = '2_3', direction = 'N', ptMap=getPtMap(flatGrid(testInput))) => {
    let ptsInDirection = []
    let pt = startPt
    let nextPt = startPt
    let ptValue = ptMap.get(nextPt)
    while (ptValue) {
        ptsInDirection.push(Number(ptValue))
        nextPt = getPt(nextPt, direction)
        ptValue = ptMap.get(nextPt)
    }
    return ptsInDirection
}
//console.log( 'getPtsInDirection ', getPtsInDirection())

const higher = (arr) => !(arr.some((e,i) => e >= arr[0] && i !== 0))
//console.log('higher false ' ,higher([2,1,5,0]))
//console.log('higher false ' , higher([2,0,2,1]))
//console.log('higher true ', higher([6,5,4,null]))
//console.log('higher getPointsInDirection', higher(getPtsInDirection()))


const isVisible = (pt, ptMap) => {
    if (higher(getPtsInDirection(pt,'N', ptMap))) return true
    if (higher(getPtsInDirection(pt,'S', ptMap))) return true
    if (higher(getPtsInDirection(pt,'E', ptMap))) return true
    if (higher(getPtsInDirection(pt, 'W', ptMap))) return true 
    return false 
}

const solveIt  = async() => {
    const input = await readlines()
    //const input = testInput
    let visibleCount = 0
    const ptMap = getPtMap(flatGrid(input))
    for (const [pt, value] of ptMap.entries()) {
        if (isVisible(pt, ptMap)) visibleCount += 1
    }
    return 'Part 1 ' + visibleCount
}

solveIt().then(console.log)

const countToHigher = (arr) => {
// count the number of entries until one equal to or greater than the first is reached
    let count = 0
    let i = 1  // arr 0 excluded
    while (arr[i] !== undefined) {
        count += 1
        if (arr[i] >= arr[0]) return count
        i +=1
    }
    return count 
}
    
const scenicScore = (pt, ptMap) => {
    const N = countToHigher(getPtsInDirection(pt,'N', ptMap))
    if (N===0) return 0
    const S  = countToHigher(getPtsInDirection(pt,'S', ptMap))
    if (S===0) return 0
    const E  = countToHigher(getPtsInDirection(pt,'E', ptMap))
    if (E===0) return 0
    const W  = countToHigher(getPtsInDirection(pt,'W', ptMap)) 
    if (W===0) return 0
    return N*S*E*W
}
    
const solveItPart2  = async() => {
    const input = await readlines()
    // const input = testInput
    let best = 0
    let score = 0
    const ptMap = getPtMap(flatGrid(input))
    for (const [pt, value] of ptMap.entries()) {
        score = scenicScore(pt, ptMap)
        if (score > best) best = score
    }
    return 'Part 2 ' + best
}


solveItPart2().then(console.log)
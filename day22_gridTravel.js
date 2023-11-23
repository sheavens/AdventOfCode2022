/* Advent of Code 2022 - Day 22: Monkey Map
Follow a map using a set of instructions to move and turn
The map is a grid of open tiles and walls.  
The path is a set of instructions to move forward a number of tiles, and turn left or right.
Example: 10R5 means "go forward 10 tiles, then turn clockwise 90 degrees, then go forward 5 tiles".
If the forward movement hits a wall, stop and continue with the next instruction.
If a movement instruction would take you off the map, it wraps around to the other side of the board.
*/

"use strict"
// read an input file with promises
const fs = require("fs").promises;
const assert = require('assert');
const _ = require("lodash")

const readlines = async() => {
    //const data = await fs.readFile('./testInput/day22_test.txt', {encoding: 'utf-8'});
    const data = await fs.readFile('day22_input.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    const blankLine = /\r\n\r\n|\r\r|\n\n/
    //return data.split(blankLine).map(e => e.split(newLine)) 
    const input = data.split(blankLine)
    const map = input[0].split(newLine).map(l => l.split(''))
    const directions = input[1].replace(/(?:\\[rn]|[\r\n]+)+/g, "") // remove newlines
    return {map: map, directions: directions}
};

// pad out lines to amx length line
const padOut = (arrArr) => {
    const maxLength = Math.max(...arrArr.map(s => s.length))
    const spaces = new Array(maxLength).fill(' ')
    return arrArr.map(l => l.length < maxLength ? l.concat(spaces.slice(0,maxLength-l.length)) : l)
} 



// GRID functions
const flatGrid = (gridArr=[['a1','a2'],['b1','b2']]) => {

    /*  store a grid input as a 2-D array as an object
        input: a 2-D matrix of grid values - strings expected 
        output: object containing 1-D array of values with grid width and height  */
    return { width: gridArr[0].length, height: gridArr.length, values: gridArr.flat() }
    }
    const fg = flatGrid()
    console.log(fg)

    //const flatGrid = (gridRowsArr) => ({width: gridRowsArr[0].length, height: gridRowsArr.length, values: gridRowsArr.flat()})
    const flatGridLiteral = (width, height, values) => ({width: width, height: height, values: values})
    
    // these functions take flatgrids but return arrays 
    const getRows = (flatGrid) => _.chunk(flatGrid.values, flatGrid.width)  // rewritten with lodash _chunk  returns new array
    //console.log('all rows', getRows(fg,0))
    // return an array of data in row rowNumber, from a flatGrid object
    const row = (flatGrid, rowNumber) => getRows(flatGrid)[rowNumber]
    //console.log('first row:', row(fg,0))
    // return an array of data in column colNumber, from a flatGrid object
    const col = (flatGrid, colNumber) => flatGrid.values.filter((e, i) => (i % flatGrid.width) === colNumber)
    //console.log('first col', col(fg,0))
    const getCols = (flatGrid) => (new Array(flatGrid.width).fill(0)).map((e,i) => col(flatGrid,i))  // returns new array
    //console.log('all columns', getCols(fg,0))
    const flipHorizontally = (flatGrid) => [...getRows(flatGrid)].map(e => e.reverse())
    //console.log('flipped horizontally', flipHorizontally(fg))
    const flipVertically = (flatGrid) => [...getRows(flatGrid)].reverse()
    //console.log('upside down', flipVertically(fg))
    const rotateClock90 = (flatGrid) => [...getCols(flatGrid)].map(e => e.reverse())
    //console.log('grid rotated clockwise 90 degrees', rotateClock90(fg))
    const rotateAnti90 = (flatGrid) => [...getCols(flatGrid)].reverse()
    //console.log('grid rotated anti-clockwise 90 degrees', rotateAnti90(fg))
   
    
    const getRows2 = (flatGrid) => {
        // return the rows of a flatGrid object, as a 2-D array
        let rows = []
        for (let r = 0; r < flatGrid.height; r++) {
            rows.push(row(flatGrid, r))   //!!! function row is missing!
        }
        return rows
    }
    
    const getColumns = (flatGrid) => {
        // return the columns of a flatGrid object, as a 2-D array    
        let cols = []
        for (let c = 0; c < flatGrid.width; c++) {
            cols.push(col(flatGrid, c))
        }
        return cols
    }
    
    // !!! array.reverse() changes the array in place !!! Use toReversed() to avoid that !!! ..toReversed() function not yet in JS ..
    const reverseRows = (flatGrid) => [...getRows(flatGrid)].map(r => r.reverse())   
    const reverseColumns = (flatGrid) =>[...getColumns(flatGrid)].map(c => c.reverse())
    // these functions return flatgrid objects
    const flipH = (flatGrid) => { return { width: flatGrid.width, height: flatGrid.height, values: reverseRows(flatGrid).flat() } }
    const flipV = (flatGrid) => {
        return { width: flatGrid.height, height: flatGrid.width, values: [...getRows(flatGrid)].reverse().flat() }
    }
    const rot90 = (flatGrid) => {
        return { width: flatGrid.height, height: flatGrid.width, values: [...getColumns(flatGrid)].flat() }
    }
    
    const printFlatGrid = (flatGrid) => {
     /* print an array, or 2D array, as a table */
            const rows = getRows(flatGrid)
            console.table(rows)
        }

    const printGridChars = (grid=[[2,3],[4,6]]) => {
        for (let r=0; r < grid.length; r++) {
            console.log(grid[r].join(' '))
        }
    }

    const rowsToCols = (grid=[[2,3],[4,6]]) => {
        let g = new Array(grid[0].length)
        for (let c=0; c < grid[0].length; c++) {
            g.push([])
            for (let r=0; r < grid.length; r++) {
                g[c].push(grid[r][c])
            }           
        }
    }

    //printGridChars()
   // printGridChars(rowsToCols())

   // puzzle-specific functions

    const getScore = (facing, position) => {
        const row = position[0]
        const col = position[1]
        const facingScore = facing === 'E' ? 0 : facing === 'S'? 1 : facing === 'W' ? 2 : 3
        return 1000 * (row + 1) + 4 * (col + 1) + facingScore // here are adjusting for the problem defing first row/col as 1, not 0
    }

    const first = (arr, row=0, col=0, sym='.') => {
        // return position of first cell in row with content sym 
        let found = false
        for (let index = +col; index < arr[1].length; index++) {
            if (arr[row][index] === sym) {
                col = +index
                found = true
                break // stop at first occurence
            }
        }
        return found ? [row,col] : [row, Infinity]
    }

    const last = (arr, row=0, col, sym='.') => {
    // return position of last cell in row with content sym 
        let found = false
        let lastColFound
        for (let index = +col; index < arr[1].length; index++) {
            if (arr[row][index] === sym) {
                found = true
                lastColFound = +index  // continue to last occurence
            }
        }
        return found ? [row,lastColFound] : [row, Infinity]
    }

    const changeFace = (wasFacing, turn) => {
    // return facing direction 'N', 'S' 'E', 'W' after turn 'L' or 'R'
        if (wasFacing === 'E' && turn === 'R' || wasFacing === 'W' && turn === 'L' ) return 'S'
        if (wasFacing === 'E' && turn === 'L' || wasFacing === 'W' && turn === 'R') return 'N'
        if (wasFacing === 'N' && turn === 'R' || wasFacing === 'S' && turn === 'L' ) return 'E'
        if (wasFacing === 'N' && turn === 'L' || wasFacing === 'S' && turn === 'R') return 'W'
    }

    const changeCoords = (pt, wasFacing, facing, map) => {
    // return coordinates as [row, col] of a point in a new grid after the original grid (map is original) has changed direction (been rotated)
        const width = map[0].length
        const height = map.length  // Width and height differ according to map - the grid of the 'wasfacing' direction
        // new position [row][col] is calculated from [oldRow=pt[0]][oldcol=pt[1]], old height and old width, according to direction grid is tiurned

       if (wasFacing === 'N' && facing === 'W' || wasFacing === 'E' && facing === 'N' || wasFacing === 'W' && facing === 'S' || wasFacing === 'S' && facing === 'E') return [pt[1],height-pt[0]-1]
       if (wasFacing === 'N' && facing === 'E' || wasFacing === 'W' && facing === 'N' || wasFacing === 'E' && facing === 'S' || wasFacing === 'S' && facing === 'W') return [width-pt[1]-1,pt[0]]
    }

    const move = (moves, position, mapRows) => {
    // travel to barrier or end of instruction length, wrappring to next row if necessary
        const row = position[0]
        let col = position[1]
        let barrier = first(mapRows, row, col, '#')[1]-1  // column position before the first parrier in the current row
        let lastOpen = last(mapRows, row, col, '.')[1] // last open position in the current row
        let firstOpen = first(mapRows, row, col, '.')[1] 
        //moves = moves + firstOpen // count moves from first open cell (could be spaces beforee this). moves === 1 will not move beyond first position
        let endInstruction = moves+col  // column + instruction number of columns - the column position to move to if no barrier or end of open positions hit first
        let stopAt = Math.min(barrier, lastOpen, endInstruction) 
        position = [row, stopAt]  // move to stopAt column
        moves = moves - (stopAt- col)
        // wrap around into next row if needed
        while (stopAt !== barrier && moves > 0) {  
            col = 0
            barrier = first(mapRows, row, col, '#')[1]-1 
            firstOpen = first(mapRows, row, col, '.')[1] 
            if (firstOpen > barrier) break // don't move further if first cell of next row is a barrier
            position = [row, firstOpen]  // start from first open cell of next row (there could be spaces before this)
            col = firstOpen
            moves = moves - 1  // at first of new line have moved on 1 space
            // update position, moves, stopAt
            lastOpen = last(mapRows, row, col, '.')[1] //
            endInstruction = moves+col // column + instruction number of columns - the column position to move to if no barrier or end of row first
            stopAt = Math.min(barrier, lastOpen, endInstruction) 
            position = [row, stopAt]
            moves = moves - (stopAt-col)
        }
        return position
    }

    let regex1 = /[0-9]+/  // any number of digits
    let regex = /([LR])([0-9]+)/g  // L or R followed by any number of digits 

const solveIt  = async() => {
    const input = await readlines()
    const firstMove = input.directions.match(regex1).map(i => +i)
    const instructions = input.directions.match(regex).map(i => [i.slice(0,1),+i.slice(1)])
    const gridEast = padOut(input.map)  //!!!!! debug slice(10) - try to use smaller grid size
    const gridSouth = rotateAnti90(flatGrid(gridEast))
    const gridWest = rotateAnti90(flatGrid(gridSouth))
    const gridNorth = rotateAnti90(flatGrid(gridWest))

    // start position in top-most left-most open cell
    let facing = 'E'
    let wasFacing
    let turn
    let map = gridEast // start heading East
    let firstOpen = first(map, 0, 0, '.')[1]
    let position = move(firstMove[0], [0,firstOpen], map)  // position as [row, col].  I am using first row/col at 0; problem defines as at 1..correct at end

    let moves

    for (let instruction of instructions) {
        console.log(instruction)
        turn = instruction[0] // turn in this direction
        wasFacing = facing
        // change the direction facing
        facing = changeFace(wasFacing, turn)
        // Using 'track up' - change the co-oddinates to those of the rotated map
        position = changeCoords(position, wasFacing, facing, map)
        // change the map (to the one facing in the new direction)
        map = facing === 'E' ? gridEast : facing === 'S' ? gridSouth : facing === 'W' ? gridWest : gridNorth
        moves = instruction[1] // move this number of places
        // move to the position on the new map
        position = move(moves, position, map)
        console.log('wasfacing, facing, position ', wasFacing, facing, position, map[position[0]][position[1]])

    }
    // change co-ordinaes to those of grid facing E
    if (facing === 'N' || facing === 'S') position = changeCoords(position, facing, 'E', map)
    if (facing === 'W') {
        position = changeCoords(position, facing, 'N', map)
        position = changeCoords(position, 'N', 'E', gridNorth) // coordinates calculated using the previous map
    }
    
    return 'Part 1 ' + getScore(facing, position)
    // 10598 too low
}

solveIt().then(console.log)




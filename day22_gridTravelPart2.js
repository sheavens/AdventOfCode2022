/* In part 2 the grid, provided as a flat diagram is to be 'folded' into a cube - the instructions now descibe travelling
around the faces of the cube */

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

function filterItems(arr, query) {
    return arr.filter((el) => el.toLowerCase().includes(query.toLowerCase()));
  }

  function filterArrs(arrs, query) {
    return arrs.filter((arr) => arr.includes(query)).flat(); // here returns one array
  }

  function indexItem(arr, query) {
    return arr.indexOf(query);
  }

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
    //const fg = flatGrid()
    //console.log(fg)

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

    const getFace = (cube, faceName, direction) => {
        let f = cube.get(faceName)
        if (direction === 'E') return f 
        f = rotateAnti90(flatGrid(f))
        if (direction === 'S') return f 
        f = rotateAnti90(flatGrid(f))
        if (direction === 'W') return f 
        f = rotateAnti90(flatGrid(f))
        if (direction === 'N') return f 
        throw new Error('Unrecognised facing direction in subroutine getFace')
    }
    
const subGrids = (grid, nAcross, nDown) => {
    const columnsWide = grid[0].length/nAcross
    const rowsDeep = grid.length/nDown
    let subGrid = []
    let subGrids = []
    let rowChunks = []
    for (let sgRow = 0; sgRow < nDown; sgRow++) {
        for (let sgCol = 0; sgCol < nAcross; sgCol++) { // for the number of sub-grids across..
            subGrid = []
            for (let row = sgRow*rowsDeep; row < sgRow*rowsDeep + rowsDeep; row++) {  //store all rows to the sub-grid
                rowChunks = _.chunk(grid[row], columnsWide) 
                subGrid.push(rowChunks[sgCol])
            }
            subGrids.push(subGrid)
        }
    }
    return subGrids
}  

const antiClockFaceMap = (faceMap) => { 
    const newFaceMap = new Map()
    for (const [key, entry] of faceMap) {
        console.log(rotateAnti90(flatGrid(entry)))
        newFaceMap.set(key, rotateAnti90(flatGrid(entry)))
    }
    return newFaceMap
}

const joinAcross = (grids) => {
    let singleGrid = []
    let oneRow = []
    for (let row = 0; row < grids[0].length; row++) {
        oneRow = []
        for (let g = 0; g < grids.length; g++) {
            oneRow.push(...grids[g][row])
        }
        singleGrid.push(oneRow)
    }
    return singleGrid
}

const solveItPart2  = async() => {
    const input = await readlines()
    const firstMove = input.directions.match(regex1).map(i => +i)
    const instructions = input.directions.match(regex).map(i => [i.slice(0,1),+i.slice(1)])
   // read the input map into 6 smaller grids - the faces of the cube.  The puzzle input has the 
   // six faces in blocks of 50 by 50 cells containing values, within a 150 by 200 input grid.
   // There are 12 (50 by 50) areas in rectangular space containg the diagram; six of which contain grid cells (or barriers)
   // The six filled areas represent faces of a cube; the diagram could be folded into a cube.
   // For part 2, follow the instructions to traverse the map, but this time following the joined faces of the cube obtained by
   // folding the map.

/*    const testCubeLayout = new Map([ //layout of the unfolded cube; faces by name in [row, col]
        ['a', [0,2]], 
        ['top', [1,0]], 
        ['b', [1,1]], 
        ['base', [1,2]], 
        ['c', [2,2]], 
        ['d', [2,3]], 
    ])
    const testCube = new Map([
        ['a', faces[0]],
        ['top', faces[1]],
        ['b', faces[2]],
        ['base', faces[3]],
        ['c', faces[4]],
        ['d', faces[5]],
    ])

    const testCubeRoutes = [  // traversal routes around the cube 
        ['top_E','b_E','base_E','d_S'],
        ['a_S','base_S','c_S','top_N'],
        ['a_E','d_W','c_W','b_N'],
        ['top_W','d_N','base_W','b_W'],
        ['a_N','top_S','c_N','base_N'],
        ['a_W','b_S','c_E','d_E'],
    ]

    const cube = testCube
    const routes = testCubeRoutes
    const layout = testCubeLayout 
    const layoutNumRows = 3
    const layoutNumCols = 4 */

    const layoutNumRows = 4
    const layoutNumCols = 3
    const wholeGrid = padOut(input.map)  
    const faces = subGrids(wholeGrid, layoutNumCols, layoutNumRows).filter(e=>!((e[0][0]).includes(' ')))
    
    const layout = new Map([ //layout of the unfolded cube; faces by name in [row, col]
    ['a', [0,1]], 
    ['b', [0,2]], 
    ['base', [1,1]], 
    ['d', [2,0]], 
    ['c', [2,1]], 
    ['top', [3,0]], 
    ])

    const cube = new Map([
        ['a', faces[0]],
        ['b', faces[1]],
        ['base', faces[2]],
        ['d', faces[3]],
        ['c', faces[4]],
        ['top', faces[5]],
    ])

    const routes = [  // traversal routes around the cube; 3, and 3 in reverse direction.
        ['a_E','b_E','c_W','d_W'],
        ['a_S','base_S','c_S','top_W'],
        ['base_E','b_N','top_N','d_N'],
        ['a_W','d_E','c_E','b_W'],
        ['a_N','top_E','c_N','base_N'],
        ['base_W','d_S','top_S','b_S'],
    ]

    const face_width = faces[0].length

    // start position in top-most left-most open cell
    // start heading East on the face .. find the route that contains the first face in the E direction
    let direction  = 'E'
    let face_name = Array.from(cube)[0][0]
    let face_index = 0

    let face_dir = [face_name, direction].join('_')
    let route = filterArrs(routes, face_dir)
    let routeMap = route.map(e => {
        const [face, direction] = e.split('_')
        return getFace(cube, face, direction) })
    let path = joinAcross(routeMap)

    let wasFacing = direction
    let turn
    
    let firstOpen = first(path, 0, 0, '.')[1]
    let faceCoords = move(firstMove[0], [0,firstOpen], path)  // position as [row, col].  I am using first row/col at 0; problem defines as at 1..correct at end
    let pathCoords = [faceCoords[0], faceCoords[1] + face_index*face_width]

    for (let instruction of instructions) {
        //console.log(instruction)

        // change the direction
        turn = instruction[0] // turn in this direction
        direction = changeFace(wasFacing, turn)
        faceCoords= changeCoords(faceCoords, wasFacing, direction, getFace(cube, face_name, direction))  // the coordinates on the face change with new direction
        face_dir = [face_name, direction].join('_')

        // 1. route containing face in this direction, full path across route
        route = filterArrs(routes, face_dir)
        routeMap = route.map(e => {
            const [face, direction] = e.split('_')
            return getFace(cube, face, direction) })
        path = joinAcross(routeMap)
        face_index = route.indexOf(face_dir)
        pathCoords = [faceCoords[0], faceCoords[1] + face_index*face_width]

        // move the number of places in instruction across the path
        pathCoords = move(instruction[1], pathCoords, path)
        faceCoords = [faceCoords[0], pathCoords[1]%face_width] 

        // 2. Cube face
        // find the face containing the position, and the direction of that face.  Find the sequence with that face in the new direction.
        face_index = Math.floor(pathCoords[1] / face_width)
        //console.log(route[face_index].split('_'))
        direction = route[face_index].split('_')[1]
        face_name = route[face_index].split('_')[0]
        //[face_name, direction] = route[face_index].split('_')
        wasFacing = direction
    }
    // change co-ordinates to those of grid direction E
    if (direction === 'N' || direction === 'S') faceCoords = changeCoords(faceCoords, direction, 'E', getFace(cube, face_name, direction))
    if (direction === 'W') { // turn West to East in two steps
        faceCoords = changeCoords(faceCoords, direction, 'N', getFace(cube, face_name, direction))
        faceCoords = changeCoords(faceCoords, 'N', 'E', getFace(cube, face_name, direction))
    }
    // get the score from the position on the unfolded cube map.
    return 'Part 2 ' + getScore(direction, [faceCoords[0]+layout.get(face_name)[0]*face_width,faceCoords[1]+layout.get(face_name)[1]*face_width])

}

solveItPart2().then(console.log)






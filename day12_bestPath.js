/* Find the shortest path in a grid that containsfrom start 'S' to finish 'E' where
only moves to cells with letter values no more than one higher than the
start value 'a' are permitted.
Part 2 requires the shortest path from paths at many different start points
*/

// read an input file with promises
const fs = require("fs").promises;

const readlines = async() => {
    const data = await fs.readFile('day12_input.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    //const blankLine = /\r\n\r\n|\r\r|\n\n/
    //return data.split(blankLine).map(e => e.split(newLine)) 
    return data.split(newLine).map(e => e.split('')) 
};

const testInput = [
'Sabqponm',
'abcryxxl',
'accszExk',
'acctuvwj',
'abdefghi',
]

const testData = testInput
        .map(d => d.split('\n'))  // array split at newlines
        .map(d => d.map(e => e.split(''))).flat()   // separate characters with commas 

/* ToDo record changes made */
const flatGrid = (gridRowsArr) => ({width: gridRowsArr[0].length, height: gridRowsArr.length, values: gridRowsArr.flat()})
const flatGridLiteral = (width, height, values) => ({width: width, height: height, values: values})

// return an array of data in row rowNumber, from a flatGrid object
// !!! ToDo changed const row = (flatGrid, rowNumber) => flatGrid.values.join('').slice(rowNumber * flatGrid.width, flatGrid.width * (rowNumber + 1)).split('')
const row = (flatGrid, rowNumber) => flatGrid.values.filter((e,i) => rowNumber === getRow(i, flatGrid))
      
// return an array of data in column colNumber, from a flatGrid object
const col = (flatGrid, colNumber) => flatGrid.values.filter((e, i) => (i % flatGrid.width) === colNumber)

// !!TODo changed - error corrected
const getRows = (flatGrid) => {
// return the rows of a flatGrid object, as a 2-D array
let rows = []
for (let r = 0; r < flatGrid.height; r++) {
    rows.push(row(flatGrid, r))
}
return rows
}

const initCost = (g = grid) => new Array(g.width * g.height).fill(Infinity)

const gridCell = (col, row, g = grid) => col + row * g.width
// returns the index of a grid cell in a (flat) array

const cellWithValue = (v, g = grid) => {
    return g.values.indexOf(v)
}

const allCellsWithValue = (v, g = grid) => {
    const indices = []
    const array = g.values
    let idx = array.indexOf(v)
    while (idx !== -1) {
        indices.push(idx)
        idx = array.indexOf(v, idx + 1)
    }
    return indices
}

const replaceValue = (v, newV, g = grid) => {
    const index = cellWithValue(v, g)
    const newValues = [...g.values.slice(0,index), newV, ...g.values.slice(index+1)]
    return flatGridLiteral(g.width, g.height, newValues)
}

const getRow = (cell, g) => Math.floor(cell / g.width) // get the row containing this cell index
const getCol = (cell, g) => cell % g.width //get the col containing this grid index

// Grid stored as flat array ..
const getNeighbours = (cell, g) => {
    // gives the array indices of neighbours for one grid cell
    // neighbours numbered 0 to grid.rows * grid.cols - 1 
    const col = getCol(cell, g)
    const row = getRow(cell, g)
    let neighbours = []
    if (col < g.width - 1) neighbours.push(cell + 1)
    if (col > 0) neighbours.push(cell - 1)
    if (row > 0) neighbours.push(cell - g.width)
    if (row < g.height - 1) neighbours.push(cell + g.width)
    return neighbours.filter(n => isValid(cell, n, g)) // only return neighbours valid to move to
}

const printFlatGrid = (flatGrid) => {
/* print an array, or 2D array, as a table */
    const rows = getRows(flatGrid)
    console.table(rows)
}

class Qelement {
    constructor(element, priority, grid) {
        this.element = element
        this.priority = priority
        this.neighbours = getNeighbours(element, grid)
    }
}

class PriorityQueue {
    constructor() {
        // an array to hold the items
        this.items = []
    }
    // methods
    isEmpty = () => this.items.length === 0

    dequeue = () => {
        if (this.isEmpty()) return "Underflow"
        return this.items.shift()
    }

    peek = () => {
        if (this.isEmpty()) return "No elements in the queue"
        return this.items[0]
    }

    enqueue = (element, priority, grid) => {
        // creating new object for the queue
        const qElement = new Qelement(element, priority, grid)
        let contain = false
        // iterating through the array to add item at the correct location
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].priority > qElement.priority) {
                this.items.splice(i, 0, qElement)
                contain = true
                break
            }
        }
        // if the element hasn't already been added it has the highest priority
        // and is added to the front of the PriorityQueue
        if (!contain) this.items.push(qElement)
    }

    changePriority = (element, newPriority) => {
        // remove the old item from the PriorityQueue
        for (let i = 0; i < items.length - 1; i++) {
            if (this.items[i].col === element.col
                && this.items[i].row === element.row) {
                this.items.splice(i, 1)
                break
            }
        }
        // enqueue the new one.
        this.enqueue(element, newPriority)
    }
}

const isValid = (cell, neighbour, grid) => {
/* move to neighbour is valid if neighbour is a letter at most one character
higher than this cell */ 
    if (grid.values[neighbour].toString().charCodeAt() <= grid.values[cell].toString().charCodeAt() + 1) return true
    return false
} 

const shortestPath = (start, end, grid, print=false) => {       
    const cost = 1  // In this version cost of each move is 1.. could be generalised to use cost array

    let q = new PriorityQueue()
    let visited = new Set()
    // Initialise all priorites to infinity
    let priority = new Array(grid.width * grid.height).fill(Infinity)
    // reset start cell to priority 0 and enqueue it
    priority[start] = 0
    q.enqueue(start, 0, grid)

    // ** Cycle of path search
    let next
    while (!q.isEmpty()) {
        // Dequeue next priority element and add it to visited set
        next = q.dequeue()
        if (!visited.has(next.element)) { // * a visited cell in the queue will already have been treated
            visited.add(next.element)
            // update cost of unvisited neighbours and add them to the Priority Queue to visit
            for (let n of next.neighbours) { 
                if (visited.has(n)) continue
                // priority reset as lowest cost to get there discovered so far
                // cells numbers same as array indices in cost array, so use indices to find them
                // cumulative ?? input cell cost + (for A*) heuristic gives priority for the queue (A*)
                if (priority[n] > next.priority + cost)  // will always be lower than initial Infinity
                    priority[n] = next.priority + cost
                // priority will always be higher if changed here.
                // * don't need to change the priority of this neighbour in the queue, just enqueue it again
                // at higher priority; it will not be used if in visited set when dequeued
                q.enqueue(n, priority[n], grid) // the cumulative cost is the priority
            }
            if (next.element === end) break  // target node reached 
        }
    }
    if (print) printFlatGrid(flatGridLiteral(grid.width, grid.height, priority))
    return priority[end]
}

const solveIt  = async() => {
    /* to do add in validity test.  cost is 1 for each neighbour but some neighbours are
    not visitible */
        const data = await readlines()
        //const data = testData
        let grid = flatGrid(data)
        // find the start cell
        const start = cellWithValue('S', grid)
        // overwrite the value of the start cell with 'a', its altitude
        grid = replaceValue('S', 'a', grid)
        // find the end cell - has value E
        const end = cellWithValue('E', grid)
        // overwrite the value of the end cell with 'z', its altitude
        grid = replaceValue('E', 'z', grid)
    
        return 'Part 1 ' + shortestPath(start, end, grid)
    
    }
    
solveIt().then(console.log)

const solveItPart2  = async() => {
/* now find shortest path from any of the start positions 'a' */
    const data = await readlines()
    //const data = testData
    let grid = flatGrid(data)
    
    // overwrite the cell with value 'S' with 'a', its altitude
    grid = replaceValue('S', 'a', grid)
    // find the end cell - has value E
    const end = cellWithValue('E', grid)
    // overwrite the value of the end cell with 'z', its altitude
    grid = replaceValue('E', 'z', grid)

    // find all possible start positions - with altitude value 'a'
    const startPositions = allCellsWithValue('a', grid)
    const shortestWays = startPositions.map(start => shortestPath(start, end, grid))
    return 'Part 2 ' + Math.min(...shortestWays.filter(v => v!== Infinity))
    
    }
    
solveItPart2().then(console.log)

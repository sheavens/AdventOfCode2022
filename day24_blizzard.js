/* Find the fastest way across a grid though a blizzard.  Blizzard elements move in the direction 
of the arrow symbols representing them, 1 place forward each timestep, and reenter the grid on the opposite side
when they cross the walls.  You cannot share a cell with a blizzard element, so the available spaces to move to
change in each timestep! For part 2 find the fastest way from start to goal, back to start and to goal again.*/

"use strict"

// read an input file with promises
const fs = require("fs").promises;
const assert = require('assert')

const readlines = async() => {
    const data = await fs.readFile('day24_input.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    //const blankLine = /\r\n\r\n|\r\r|\n\n/
    //return data.split(blankLine).map(e => e.split(newLine)) 
    return data.split(newLine).map(e=> e.split(''))
};

const testInput = [
'#.######',
'#>>.<^<#',
'#.<..<<#',
'#>v.><>#',
'#<^v^^>#',
'######.#',
]


// Priority Queue  
class Qelement {
    constructor(element, priority, grid) {
        this.element = element
        this.priority = priority
       // this.neighbours = getNeighbours(element, grid) // optional
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

    length = () => this.items.length

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

// Problem specifc functions
const updateBlizElement = (t, startAt, facing) => {
// finds position of a single blizzard element at timeStep t

}

// return an array of data in column colNumber, from a flatGrid object
const col = (flatGrid, colNumber) => flatGrid.values.filter((e, i) => (i % flatGrid.width) === colNumber)

const colsToRows = (grid) => {
    // return the grid with columns as rows (rotated)   
    let rotated = []
    for (let i = 0; i < grid[0].length; i++) {
        rotated.push([])
        for (let c = 0; c < grid.length; c++) {
            rotated[i].push(grid[c][i])
        }
    }
    return rotated
}

const cycle = (index, n, lo, hi)  => {
    // outputs numbers in a cycle increasing from lo to hi.   increment n moves n places through cycle
    // starting index must be within the range
    if (index > hi || index < lo) {
        console.log('index must be within the range: ', lo, hi)
        return null
    }
    return (index+n-lo)%(hi-lo+1) + lo
    // the % returns a number 0 to hi-lo+1.  -lo in top and +lo at end gets it in the range lo to hi
}
const reverseCycle = (index, n, lo, hi) => {
    // outputs numbers in a cycle decreasing from hi to lo.  increment n moves n places through cycle, in reverse
    // starting index must be within the range
    if (index > hi || index < lo) {
        console.log('index must be within the range: ', lo, hi)
        return null
    }
    const max = hi-lo+1
    return ((index-n-lo)%max + max)%max +lo// double % needed because of -ve numbers from js remainder when inputs -ve. 
    // the % returns a number 0 to hi-lo+1.  -lo in top and +lo at end gets it in the range lo to hi 
}

//console.log([0,1,2,3,4,5,6,7,8,9,10].map(e=>cycle(e,e,1,6))) 
//console.log([0,1,2,3,4,5,6,7,8,9,10].map(e=>reverseCycle(e,e,1,6)))

const updateBlitzLine = (t, index, vertical, blizzard0) => {
// updates a line in the blizzard array at time step t
   const line = !vertical ? blizzard0[index] : colsToRows(blizzard0)[index]  // ToDo store b0 as v and h versions rather than calc each time
   const border = '#'
   //line = line.slice(1,line.length)

   let newLine = Array(line.length).fill('.')
   //newLine[0] = line[0] !=='E' ? border : '.'  //  position will be still free unless a blizzard element moves to it
   //newLine[line.length-1] = border
   line.forEach((e,i) => {if (e === border) {newLine[i] = border}})
   if (vertical) {
    //console.log('vertical line', line)
    line.forEach((e,i) => {if (e === 'v') {newLine[cycle(i,parseInt(t),1,line.length-2)] = 'D'}})
    //console.log('newLine', newLine)
    line.forEach((e,i) => {if (e === '^') {newLine[reverseCycle(i,parseInt(t),1,line.length-2)] = 'U'}})
    //console.log('newLine', newLine)
   } else {
    //console.log('horizontal line', line)
    line.forEach((e,i) => {if (e === '>') {newLine[cycle(i,parseInt(t),1,line.length-2)] = 'F'}})
    //console.log('newLine', newLine)
    line.forEach((e,i) => {if (e === '<') {newLine[reverseCycle(i,parseInt(t),1,line.length-2)] = 'R'}})
    //console.log('newLine', newLine)
   }
   return newLine

}


const boundaries = (blizzard0) => {
    // set boundaries for blizzard - excludes edges
    return {N:1, S:blizzard0.length-2, E:blizzard0[0].length-2, W:1}
}

const position = (time_x_y) => {
// store sting of timestep and x, y position
    // return time_x_y.join('_')
    return {t:+time_x_y[0],x:+time_x_y[1],y:+time_x_y[2]}
}

const isEmpty = (position, blizzard0) => {
    //store grid boundaries
    const bounds = boundaries(blizzard0)
    const start = getStart(blizzard0)
    const atStart = start.x === position.x && start.y === position.y
    const target = getTarget(blizzard0)
    const atTarget = target.x === position.x && target.y === position.y
    // check x line
    if ((position.x > bounds.E || position.x < bounds.W) && !atStart && !atTarget) return false  // fails unless bounds check first (-ve indices for blizzard array arise)
    if (updateBlitzLine(position.t, position.x, true, blizzard0)[position.y] !== '.') return false

    //check y line
    //console.log(blizzard0[position.y][position.x] !== 'E') // !! careful x y
    if ((position.y > bounds.S || position.y < bounds.N) && !atStart && !atTarget) return false
    if (updateBlitzLine(position.t, position.y, false, blizzard0)[position.x] !== '.') return false

    return true

}

const isChar = (char, sym) => char === sym

const getStart = (blizzard0, sym='.') => {
    const start = blizzard0[0].findIndex((x) => x === sym) // useful - find index of element matching func
    return {x:start, y:0} 
}

const getTarget = (blizzard0) => {
    const target_x = blizzard0[blizzard0.length-1].findIndex((x) => x === '.')
    return {x:target_x, y:blizzard0.length-1}
}
const solveIt  = async() => {  
    // This code allows the blizzard to be started at any time t..
    // Part 1 t = 0 Part2 t = 343 (part1 soln), and back to start, t = 663 .. back to target
    let t = 663  // 0, 343, 663 .. for stages start to target, and back, and back to target
    // change the start and target position to go from start or from original target
    const blizzard0 = await readlines()
    //const blizzard0 = testInput.map(e=> e.split(''))
    // locate expedition entry position on top edge {t x y}
    //let E = position([t, getTarget(blizzard0).x, getTarget(blizzard0).y]) // from target
    let E = position([t, getStart(blizzard0).x, getStart(blizzard0).y]) // from start
    const q = new PriorityQueue()
    q.enqueue(E,0)  // q the entry position
    // store target on bottom edge {x,y}
    //const target = getStart(blizzard0) // from target
    const target = getTarget(blizzard0) // from start
    let below, right, left, here, up
    let next
    let moves = 0
    let bestMoves = Infinity
    const visited = new Set()
    // Loop over moves to target
    while (!q.isEmpty()) {
        next = q.dequeue()
        // move to next position in the Queue
        E = next.element
        // store time and position as string in visited set - no need to revisit this position at the same timestep.
        visited.add(JSON.stringify(E))  
        //console.log('!! :', visited.has(JSON.stringify(position([t, E.x, E.y]))))
        // if no positions in queue at potentially lower moves to target - stop - best soln found.
        while (E.t+next.priority >= bestMoves) {
           if (q.isEmpty()) return 'Part1: ' + bestMoves
            next = q.dequeue()
            E = next.element
        }
        // if at target - store the noves taken
        if (E.x === target.x && E.y === target.y){
            moves = t
            if (moves < bestMoves) bestMoves = moves
            // console.log('bestMoves ', bestMoves)
            // console.log('queue length ', q.length())
        } else {
            // add empty positions (current postion and neighbors), at next time step, to the queue
            t = E.t+1
            below = position([t, E.x, E.y+1])
            right = position([t, E.x+1, E.y])
            left = position([t, E.x-1, E.y])
            here = position([t, E.x, E.y]) // could stay here if still empty
            up = position([t, E.x, E.y-1])
            // load available moves to Priority Queue in order of manhatten distance to target
            if (isEmpty(below, blizzard0) && !visited.has(JSON.stringify(below))) {q.enqueue(below, Math.abs(target.x-below.x)+Math.abs(target.y-below.y))}  
            if (isEmpty(right, blizzard0) && !visited.has(JSON.stringify(right))) {q.enqueue(right, Math.abs(target.x-right.x)+Math.abs(target.y-right.y))}  
            if (isEmpty(left, blizzard0) && !visited.has(JSON.stringify(left))) {q.enqueue(left, Math.abs(target.x-left.x)+Math.abs(target.y-left.y))}  
            if (isEmpty(here, blizzard0) && !visited.has(JSON.stringify(here))) {q.enqueue(here, Math.abs(target.x-here.x)+Math.abs(target.y-here.y))}  
            if (isEmpty(up, blizzard0) && !visited.has(JSON.stringify(up))) {q.enqueue(up, target.x-up.x+target.y-up.y)}  
            visited.add(JSON.stringify(up))   // found that same items were being queued .. presume being re-queued before being visited.. so add to visited set here
            visited.add(JSON.stringify(below))
            visited.add(JSON.stringify(left))
            visited.add(JSON.stringify(right))
            visited.add(JSON.stringify(here))
        }
    }
    return 'Part2: ' + bestMoves
}

solveIt().then(console.log)
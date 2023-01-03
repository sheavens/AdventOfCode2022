// read an input file with promises
const fs = require("fs").promises;

// grid functions
//ToDo !!! changed to simply grid.flat()
const flatGrid = (gridArr) => {
    /*  store a grid input as a 2-D array as an object
        input: a 2-D matrix of grid values - strings expected 
        output: object containing 1-D array of values with grid width and height  */
    return { width: gridArr[0].length, height: gridArr.length, values: gridArr.flat() }
}

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

const pureStack = (arr=[]) => {
    let stack = arr
    function getStack() {
        return stack
    }
    function push(pushThis) {
        stack = [pushThis, ...stack]
        return stack
    }
    function pop() {
        if (empty(stack)) return null
        stack = stack.slice(1)
        return stack
    }
    function peek() {
        if (empty(stack)) return null
        return stack.slice(0,1)
    }
    function empty() {
        if (stack.length === 0) return true
        return false
    }
    function multiPush(pushThese) {
        stack = [...pushThese, ...stack]
        return stack
    }
    function multiPop(n=1) {
        if (stack.length < n) return null
        stack = stack.slice(0,n)
        return stack
    }
            // toDo make a pureStacks factory function
    return { 
        push: push,
        pop: pop,
        peek: peek,
        empty: empty,
        multiPush: multiPush,
        multiPop: multiPop
    }
}

const testStack = pureStack([3,4,5]).push()>testStackop(3)
console.log(testStack)


const readlines = async() => {
    const data = await fs.readFile('day5_input.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    const blankLine = /\r\n\r\n|\r\r|\n\n/
    return data.split(blankLine).map(e => e.split(newLine)) 
    //consolereturn data.split(newLine)
};

const onlySpaces = (str) => {
    return /^\s*$/.test(str);
}

const loadStrings = (string, regex=/(\w)/g) => {
    return string.match(regex)
}

const loadNumbers = (string, regex=/\d+/g) => {
    return string.match(regex).map(e => Number(e))
}

const loadTest = '1gyh45ju,678,kjuo,098,hy'
console.log(loadStrings(loadTest), loadNumbers(loadTest))

const moveStacks = ([numMoves, fromStack, toStack], stacks) => {
    for (let move = 0; move < +numMoves; move++) {
        //stacks[toIdx].push(stacks[fromIdx].pop()) // pop changes in place - try slice
        const fromIdx = fromStack - 1
        const toIdx = toStack - 1
        stacks[toIdx] =  [stacks[fromIdx][0],...stacks[toIdx]]
        stacks[fromIdx] = stacks[fromIdx].slice(1)
    }  
    return stacks
}

const multiMoveStacks = ([numMoves, fromStack, toStack], stacks) => {
        const fromIdx = fromStack - 1
        const toIdx = toStack - 1
        stacks[toIdx] =  [...stacks[fromIdx].slice(0,numMoves),...stacks[toIdx]]
        stacks[fromIdx] = stacks[fromIdx].slice(numMoves)
   // }  
    return stacks
}

const stackTops = (stacks) => stacks.map(e => e[0]).flat()

const solveIt  = async() => {
    const input = await readlines()
    const stackRows = input[0].slice(0,-1).map(e => loadStrings(e, /(\s\s\s\s)|([\w])/g))
    const moves = input[1].map(e => loadNumbers(e, /\d+/g))
    let stacks = getColumns(flatGrid(stackRows)).map(e => e.filter(d => !(onlySpaces(d))))
    let count = 0
    for (let move of moves) { 
       stacks = moveStacks(move, stacks)
    }
    return 'Part 1 ' + stackTops(stacks).join('')
}

//solveIt().then(console.log)

const solveItPart2  = async() => {
    const input = await readlines()
    const stackRows = input[0].slice(0,-1).map(e => loadStrings(e, /(\s\s\s\s)|([\w])/g))
    const moves = input[1].map(e => loadNumbers(e, /\d+/g))
    let stacks = getColumns(flatGrid(stackRows)).map(e => e.filter(d => !(onlySpaces(d))))
    let count = 0
    for (let move of moves) { 
       stacks = multiMoveStacks(move, stacks)
    }
    return 'Part 2 ' + stackTops(stacks).join('')
}

solveItPart2().then(console.log)

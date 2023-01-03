/* day 1 - Part 1 find maximum calories, max sum of inner lists 
Part 1 find sum of top 3 highest calorie sums*/

// read an input file with promises
const fs = require("fs").promises;

testInput = [[1000,
2000,
3000],

[4000],

[5000,
6000],

[7000,
8000,
9000],

[10000]];


const sumIt = (arr) => arr.reduce((accum, next) => accum + Number(next), 0)
const flatSumIt = (arr) => (arr.map(innerArr => sumIt(innerArr)).flat())
const sortHiLo = (arr) => arr.sort((a,b) => b - a)

//console.log(flatSumIt(testInput))
//console.log(sortHiLo(flatSumIt(testInput)))

const readlines = async() => {
    const data = await fs.readFile('day1_input.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    const blankLine = /\r\n\r\n|\r\r|\n\n/
    return data.split(blankLine).map(e => e.split(newLine)) 
};

const solveIt  = async() => {
    const input = await readlines()
    return 'Part 1 ' + Math.max(...flatSumIt(input))
}

solveIt().then(console.log)

const solveItPart2  = async() => {
    const input = await readlines()
    // const input = testInput
    return 'Part 2 ' + sumIt(sortHiLo(flatSumIt(input)).slice(0,3))
}

solveItPart2().then(console.log)
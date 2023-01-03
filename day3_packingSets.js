// read an input file with promises
const fs = require("fs").promises;

const readlines = async() => {
    const data = await fs.readFile('day3_input.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    //const blankLine = /\r\n\r\n|\r\r|\n\n/
    //return data.split(blankLine).map(e => e.split(newLine)) 
    return data.split(newLine)
};

const testInput = ['vJrwpWtwJgWrhcsFMMfFFhFp',
'jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL',
'PmmdzqPrVvPwwTWBwg',
'wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn',
'ttgJtRGJQctTZtZT',
'CrZsJsPPZsGzwwsLwLmpwMDw']

const union = (setA, setB) => new Set([...setA, ...setB])
// return set that are in either input set
// console.log("union", union(new Set([1,2,3,4,5]), new Set([1,3,5,7,9])))

const intersection = (setA, setB) => {
    // rerurn set that are in both input sets
    return new Set([...setA].filter(x => setB.has(x)))
}
// console.log("intersection", intersection(new Set([1,2,3,4,5]), new Set([1,3,5,7,9])))

const difference = (setA, setB) => {
    // return set that are in SetA but not in Set B
    return new Set([...setA].filter(x => !setB.has(x)))
}


const letterValue = (letter='z') => {
/* a-z have codes 1-26  ascii codea are 97-177
A-Z have codes 27-52  (ascii codes are 65-90)*/
    const ascii = letter.charCodeAt()
    return ascii > 90 ? ascii - 97 + 1 : ascii - 65 + 27
}
//console.log(letterValue())

const sumArr = (arr) => arr.reduce ((a, b) => a + b, 0)
//console.log(sumArr([1,4,5]))

const shared = (arrSets) => arrSets.reduce((a, b) => intersection(a, b))

const solveIt  = async() => {
    const readIn = await readlines()
    const input = readIn.map(e => e.split(''))
    const common = Array.from(input.map(e => intersection(new Set(e.slice(0,e.length/2)), 
    new Set(e.slice(e.length/2)))))
    const letterCodes = common.map(e => letterValue(e.values().next().value))
    return 'Part1 ' + sumArr(letterCodes)
}

solveIt().then(console.log)

const solveItPart2  = async() => {
    const readIn = await readlines()
    const input = readIn.map(e => e.split(''))
    let arrSets = []
    let common = []
    for (let i=0; i<input.length; i++) {
        arrSets.push(new Set(input[i]))
        if ((i + 1) % 3 === 0) {
            common.push(shared(arrSets))
            arrSets = []
        }
    }    
    const letterCodes = common.map(e => letterValue(e.values().next().value))
    return 'Part2 ' + sumArr(letterCodes)
}

solveItPart2().then(console.log)
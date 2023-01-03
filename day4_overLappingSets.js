// read an input file with promises
const fs = require("fs").promises;

const readlines = async() => {
    const data = await fs.readFile('day4_input.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    //const blankLine = /\r\n\r\n|\r\r|\n\n/
    //return data.split(blankLine).map(e => e.split(newLine)) 
    return data.split(newLine)
};

const testInput = [
'2-4,6-8',
'2-3,4-5',
'5-7,7-9',
'2-8,3-7',
'6-6,4-6',
'2-6,4-8',
]

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

const range = (start, stop, step) => {
    const arrayLength = Math.floor(((stop - start) / step)) + 1;
    return [...Array(arrayLength).keys()].map(x => (x * step) + start);
}

const containsSet = (setA, setB)  => {
    const combined = union(setA, setB)
    return combined.size === setA.size || 
    combined.size === setB.size ? true : false
}

const overlapSet = (setA, setB)  => {
    const combined = union(setA, setB)
    return combined.size === setA.size + setB.size ? false : true
}

const toNumbers = (pair = '4-6') => pair.split('-').flatMap(e => +e)    
//console.log('toNumbers ' + toNumbers())

const toRange = (pair = '4-6') => {
    const numberPair = toNumbers(pair)
    return range(numberPair[0], numberPair[1], 1)
}
//console.log('toRange ' + toRange())

const solveIt  = async() => {
    const readIn = await readlines()
    const input = readIn.map(e => e.split(','))

    const contained = input.map(e => 
        containsSet(new Set(toRange(e[0])), new Set(toRange(e[1]))))
    
    return 'Part1 ' + contained.filter(e => e === true).length

}

solveIt().then(console.log)

const solveItPart2  = async() => {
    const readIn = await readlines()
    const input = readIn.map(e => e.split(','))

    const overlapped = input.map(e => 
        overlapSet(new Set(toRange(e[0])), new Set(toRange(e[1]))))
    
    return 'Part2 ' + overlapped.filter(e => e === true).length

}

solveItPart2().then(console.log)
/* Task is to find the number of items processed by each monkey, 
and return the product of the two largest numbers.  

Example input each monkey
Monkey 0:
  Starting items: 79, 98
  Operation: new = old * 19
  Test: divisible by 23
    If true: throw to monkey 2
    If false: throw to monkey 3

Monkeys throw items to other monkeys.. which if still to go in the same
round will process these too in the round.

Part two required new logic as numbers otherwise exploded to incalculable sizes.  
Trick used was to keep only the remainder of the calculation divided by
the various divisors - all were prime numbers - and the result determines
which monkey the item is passed to next. */

// read an input file with promises
const fs = require("fs").promises
const assert = require('assert')

const readlines = async() => {
    const data = await fs.readFile('day11_input.txt', {encoding: 'utf-8'});
    //const data = await fs.readFile('./testInput/day11_test.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    const blankLine = /\r\n\r\n|\r\r|\n\n/
    //return data.split(blankLine).map(e => e.split(newLine)) 
    return data.split(blankLine).map(e => e.split(newLine)).map(e => e.slice(1))
};

const range = (start, stop, step) => {
    const arrayLength = Math.floor(((stop - start) / step)) + 1;
    return [...Array(arrayLength).keys()].map(x => (x * step) + start);
}

const digit = /(\d+)/
const digits = /(\d+)+/g
const times = /(\*)|(\+|(old)|(\d+))/g
const expression =/(old) | (\*) | (\d+) | (\+)/g
const words = /(\w)+/

const monkeyOps = (lines) => {
    let divisor
    let items
    let monkey
    let func
    let f
    let arr
    let obj = {}
    for (let line of lines) {
        if (/Test:/.test(line)) {
            obj.divisor = +line.match(digit)[1]
        }
        if (/items:/.test(line)) {
            obj.items = line.match(digits).map(e=>+e)
        }
        if (/true:/.test(line)) {
            obj.throwToIfTrue = +line.match(digit)[1]
        }
        if (/false:/.test(line)) {
            obj.throwToIfFalse = +line.match(digit)[1]
        }
        if (/Operation:/.test(line)) {
            obj.operation  = line.match(times).join(' ')
        } 
    }
return obj
}

const testInput = [
'Monkey 0:',
'  Starting items: 79, 98',
'  Operation: new = old * 19',
'  Test: divisible by 23',
'    If true: throw to monkey 2',
'    If false: throw to monkey 3',
'',
'Monkey 1:',
'  Starting items: 54, 65, 75, 74',
'  Operation: new = old + 6',
'  Test: divisible by 19',
'    If true: throw to monkey 2',
'    If false: throw to monkey 0',
'',
'Monkey 2:',
'  Starting items: 79, 60, 97',
'  Operation: new = old * old',
'  Test: divisible by 13',
'    If true: throw to monkey 1',
'    If false: throw to monkey 3',
'',
'Monkey 3:',
'  Starting items: 74',
'  Operation: new = old + 3',
'  Test: divisible by 17',
'    If true: throw to monkey 0',
'    If false: throw to monkey 1 ',
]
const monkeyProcess = (monkey, level, obj, held) => {
    const func = (old) => eval(obj.operation)
    level = Math.floor(func(level)/3)
    if (level % obj.divisor === 0) {  
        held[obj.throwToIfTrue] = [...held[obj.throwToIfTrue], level] 
    } else { 
        held[obj.throwToIfFalse] = [...held[obj.throwToIfFalse], level]
    }
    held[monkey] = held[monkey].slice(1)
    return held
} 

const solveIt  = async() => {
    const input = await readlines()
    let monkeys = (input.map((e,i) => monkeyOps(input[i])))
    let rounds = 20
    let held = []
    let processed = new Array(monkeys.length).fill(0)
    for (let monkey in monkeys) {
        held[monkey] = monkeys[monkey].items
    }
    for (let round = 0; round < rounds; round = round + 1) {
        for (let monkey in monkeys) {
            for (let level of held[monkey]) {
              held = monkeyProcess(monkey, level, monkeys[monkey], held)
              processed[monkey] += 1
            } 
        }
    }
    processed.sort((a,b) => b-a).slice(0,2)
    return 'Part 1 ' + processed[0] * processed[1]
}

//solveIt().then(console.log)
const updateLevelMap = (key, func, divisor, levelMap) => {
    return levelMap.set(key, func(levelMap.get(key)) % divisor)
}
const monkeyProcessPart2 = (monkeyHolding, levelMap, monkeys) => {
    const func = (old) => eval(monkeys[monkeyHolding].operation)
    // apply func to remainder for each monkey remainder
    for (let m = 0; m < monkeys.length; m++) {
       levelMap = updateLevelMap(m, func, monkeys[m].divisor, levelMap)
    }
    if (levelMap.get(monkeyHolding) === 0) {  
        //if (obj.divisor === 23) level = Math.floor(level / obj.divisor) // !! some prime trick needed
        monkeyHolding =  monkeys[monkeyHolding].throwToIfTrue 
    } else { 
        monkeyHolding =  monkeys[monkeyHolding].throwToIfFalse
    }
    return {'monkeyHolding': monkeyHolding, 'levelMap': levelMap}
} 

const solveItPart2  = async() => {
    const input = await readlines()
    let monkeys = (input.map((e,i) => monkeyOps(input[i])))
    let rounds = 10000
    let held = []
    let monkeyHolding
    let levelMap
    let processed = new Array(monkeys.length).fill(0)
    let resultObj
    for (let monkey in monkeys) {
        held[monkey] = monkeys[monkey].items
    }
    
    for (let monkey in monkeys) {
        
        for (let level of held[monkey]) {

            levelMap = new Map()
            monkeys.map((m,i) => levelMap.set(i, level % m.divisor))
            monkeyHolding = monkey
            for (let round = 0; round < rounds; round = round + 1) { // processing one item through all rounds; they are independent of each other
                lastHolding = -1
                while (monkeyHolding > lastHolding) {
                    lastHolding = monkeyHolding
                    processed[monkeyHolding] += 1
    // This failed - why? ({monkeyHolding, levelMap}) = monkeyProcessPart2(monkeyHolding, levelMap, monkeys)
                    resultObj = monkeyProcessPart2(monkeyHolding, levelMap, monkeys)
                    monkeyHolding = resultObj.monkeyHolding
                    levelMap = resultObj.levelMap
                }
            }
        } 
    }
    processed.sort((a,b) => b-a).slice(0,2)
    return 'Part 2 ' + processed[0] * processed[1]
}

solveItPart2().then(console.log)

/* proof of concept: the test for func(x) % (prime) divisor gives the same result 
as testing the func(x % divisor) % divisor. 
... can keep track of the remainders for each entry for each divisor  => numbers then
will not blow up to impossible numbers over 10,000 rounds */
console.log('original big number 79*79', (79*79 + 6)%19)
console.log('remainder only 79*79%19 for next test %19', (((79*79)%19) +6)%19)
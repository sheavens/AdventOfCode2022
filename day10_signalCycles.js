// read an input file with promises
const fs = require("fs").promises
const assert = require('assert')

const readlines = async() => {
    //const data = await fs.readFile('./testInput/day10_test.txt', {encoding: 'utf-8'});
    const data = await fs.readFile('day10_input.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    //const blankLine = /\r\n\r\n|\r\r|\n\n/
    //return data.split(blankLine).map(e => e.split(newLine)) 
    return data.split(newLine)
};

const testInput = [
'noop',
'addx 3',
'addx -5',
]

const addX = /addx\s+(-*\d+)/
const noop = /noop/


function getXatCycle(input) {
    let X = 1
    let cycles = 0
    let targetCycle = 20
    let signalStrength = 0
    let sumStrength = 0

    for (let entry of input) {
        if (addX.test(entry)) {
            console.log(cycles, X)

            if (cycles+1 === targetCycle) {
                console.log('During addX cycle 2 ', targetCycle * X) //target reached before next reading
                signalStrength = targetCycle * X
                sumStrength = sumStrength + signalStrength
                if (targetCycle < 220) targetCycle += 40
            }
            cycles +=2
            if (cycles=== targetCycle) {
                console.log('After addX cycle 2.5 ', targetCycle * X) //target reached before next reading
                signalStrength = targetCycle * X
                sumStrength = sumStrength + signalStrength
                if (targetCycle < 220) targetCycle += 40
            }
            console.log(entry.match(addX)[1] )
            X += Number(entry.match(addX)[1])
        } else if (noop.test(entry)){ 
            cycles += 1
            if (cycles === targetCycle) {
                console.log('After Noop cycle 4 ', targetCycle * X) //target reached before next reading
                signalStrength = targetCycle * X
                sumStrength = sumStrength + signalStrength
                if (targetCycle < 220) targetCycle += 40
            }
        } else {
            console.log('entry not recognised ', entry)
        }
    }
    return sumStrength
}

const solveIt  = async() => {
    const input = await readlines()
    return 'Part 1 ' + getXatCycle(input)
}

solveIt().then(console.log)
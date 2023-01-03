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


const screen = () => {
    let pixelLine = '' // hold pixelLine in closure

    return (pixel, X) => {
        const spritePixels = [X-1, X, X + 1]
        const litPixel = spritePixels.includes(pixel % 40) ? '@' : '.'
        pixelLine = pixelLine + litPixel
        if (pixel > 0 && (pixel+1) % 40 === 0) {
            console.log(pixelLine)
            pixelLine = ''
        }
    }
}
const addToScreen = screen()

function getXatCycle(input) {
    let X = 1
    let cycles = 0
    let pixel = -1
    let targetCycle = 20
    let signalStrength = 0
    let sumStrength = 0

    for (let entry of input) {
        if (addX.test(entry)) {
            addToScreen(pixel+1, X)
            addToScreen(pixel+2, X)
            cycles +=2
            pixel +=2
            X += Number(entry.match(addX)[1])
        } else if (noop.test(entry)){ 
            addToScreen(pixel+1, X)
            cycles += 1
            pixel +=1  
        } else {
            console.log('entry not recognised ', entry)
        }
    }
    return // image is on console
}

const solveIt  = async() => {
    const input = await readlines()
    return 'Part 2 ' + getXatCycle(input)// image on the console
}

solveIt().then(console.log)
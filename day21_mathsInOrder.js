const { camelCase, isNumber } = require("lodash")

/* work out what the 'root' monkey will yell.  He has to wait for other monkeys to call the results 
of prior calculations, or input numbers, to give the inputs */

const testInput = [
'root: pppw + sjmn',
'dbpl: 5',
'cczh: sllz + lgvd',
'zczc: 2',
'ptdq: humn - dvpt',
'dvpt: 3',
'lfqf: 4',
'humn: 5',
'ljgn: 2',
'sjmn: drzm * dbpl',
'sllz: 4',
'pppw: cczh / lfqf',
'lgvd: ljgn * ptdq',
'drzm: hmdt - zczc',
'hmdt: 32',
]


// read an input file with promises
const fs = require("fs").promises
const assert = require('assert');
const _ = require("lodash")
const { isKeyObject } = require("util/types");

const readlines = async() => {
    const data = await fs.readFile('day21_input.txt', {encoding: 'utf-8'});
    //const data = await fs.readFile('./testInput/day16_test.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    //const blankLine = /\r\n\r\n|\r\r|\n\n/
    //return data.split(blankLine).map(e => e.split(newLine)) 
    return data.split(newLine)
};


// make a single object from input
const makeObject = (lines) => {
    const obj = Object.fromEntries(lines.map(line => line.split(':')))
    return obj
}



function add(a,b) { return a + b}
function sub(a,b) {return a - b}
function div(a,b) { return a / b}
function mult(a,b) {return a * b}

const strRegex = /(\w+)/g
const multRegex = /(\*)/g
const divRegex = /(\/)/g
const addRegex = /(\+)/g
const subRegex = /(\-)/g

const getFunc = (str) => {
    if (str.match(multRegex)) return mult
    if (str.match(divRegex)) return div
    if (str.match(addRegex)) return add
    if (str.match(subRegex)) return sub
}

const getParams = (str) => str.match(strRegex)
 

const solveIt  = async() => {
    const input = await readlines()

    // replace functions as objects of {func: sum or mult or div, a: b:}
    const shouts = makeObject(input)
    for (let [key, value] of Object.entries(shouts)) {
        if (!isNaN(value)) { 
            shouts[key] = Number(value) 
        } else {
            shouts[key] = {func: getFunc(value), a: getParams(value)[0], b: getParams(value)[1]}
        }
    }

    // loop while root unresolved .. replace a and b with number values and when both number values replace object with function result
    while (!_.isNumber(shouts.root)) {
        for (let [key, obj] of Object.entries(shouts)) {
            if (_.isObject(obj)) { 
                if (_.isNumber(shouts[obj.a])) obj.a = shouts[obj.a] 
                if (_.isNumber(shouts[obj.b])) obj.b = shouts[obj.b] 
                if (_.isNumber(obj.a) && _.isNumber(obj.b))  shouts[key] = obj.func(Number(obj.a),Number(obj.b))  // replace object with the result of the function
            }
        }
    }
    return 'Part 1 ' + shouts.root
}
solveIt().then(console.log)

const setShouts = (input) => {
    // set up object from input
    // replace functions as objects of {func: sum or mult or div, a: b:}
    const shouts = makeObject(input)
    for (let [key, value] of Object.entries(shouts)) {
        if (!isNaN(value)) { 
            shouts[key] = Number(value) 
        } else {
            shouts[key] = {func: getFunc(value), a: getParams(value)[0], b: getParams(value)[1]}
        }
    }
    return shouts
}

const binarySearch = (list, item) => {
    let low = 0
    let high = list.length - 1
  
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const guess = list[mid]
  
      if (guess === item) {
        return mid
      }
  
      if (guess > item) {
        high = mid - 1
      } else {
        low = mid + 1
      }
    }
  
    return null //if not found
  }



const solveItPart2  = async() => {
// Part 2 - find a value of shouts.humn that makes root.a equal root.b
    const input = await readlines()
    //const input = testInput
    let shouts = setShouts(input) 
    shouts.humn = 1  // reset shouts.humn to some initial value
    let factor =  0
    let diff, lastDiff
    let temp
    const r1 = shouts.root.a
    const r2 = shouts.root.b
    while (shouts[r1] !== shouts[r2]) {
        // loop while root unresolved .. replace a and b with number values and when both number values replace object with function result
        if (_.isNumber(shouts[r1]) && _.isNumber(shouts[r2])) {
            diff = Math.abs(shouts[r1] - shouts[r2])
            if (factor === 0) factor = Math.ceil(Math.max(shouts[r1], shouts[r2]))  // chose to set initial adjustment factor on scale of these results
            temp = shouts[r1] > shouts[r2] ?  shouts.humn + factor : shouts.humn - factor // !! traila and error used for > sign!
            if (diff < lastDiff) factor = Math.ceil(factor*0.9) // reduce adjustment factor as get closer 
            lastDiff = diff
            shouts = setShouts(input)  // reset the shouts object from the input
            // increase/decrease shouts.humn to get closer to root values passing the test
            shouts.humn = temp
        }   
        while (!_.isNumber(shouts.root)) {
            for (let [key, obj] of Object.entries(shouts)) {
                if (_.isObject(obj)) { 
                    if (_.isNumber(shouts[obj.a])) obj.a = shouts[obj.a] 
                    if (_.isNumber(shouts[obj.b])) obj.b = shouts[obj.b] 
                    if (_.isNumber(obj.a) && _.isNumber(obj.b))  shouts[key] = obj.func(Number(obj.a),Number(obj.b))  // replace object with the result of the function
                }
            }
        }
    }
    return 'Part 2 ' + shouts.humn
}
solveItPart2().then(console.log)
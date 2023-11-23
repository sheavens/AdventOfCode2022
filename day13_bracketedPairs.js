/* Rules are given to determine the correct order of bracketed expressons of the form:

---------------------------
[1,1,3,1,1]
[1,1,5,1,1]

[[1],[2,3,4]]
[[1],4]

[9]
[[8,7,6]]

[[4,4],4,4]
[[4,4],4,4,4]

[7,7,7,7]
[7,7,7]

[]
[3]

[[[]]]
[[]]

[1,[2,[3,[4,[5,6,7]]]],8,9]
[1,[2,[3,[4,[5,6,0]]]],8,9]

--------------------------------

Packet data consists of lists and integers. Each list starts with [, ends with ], and contains zero or more comma-separated values (either integers or other lists). Each packet is always a list and appears on its own line.

When comparing two values, the first value is called left and the second value is called right. Then:

If both values are integers, the lower integer should come first. If the left integer is lower than the right integer, the inputs are in the right order. If the left integer is higher than the right integer, the inputs are not in the right order. Otherwise, the inputs are the same integer; continue checking the next part of the input.
If both values are lists, compare the first value of each list, then the second value, and so on. If the left list runs out of items first, the inputs are in the right order. If the right list runs out of items first, the inputs are not in the right order. If the lists are the same length and no comparison makes a decision about the order, continue checking the next part of the input.
If exactly one value is an integer, convert the integer to a list which contains that integer as its only value, then retry the comparison. For example, if comparing [0,0,0] and 2, convert the right value to [2] (a list containing 2); the result is then found by instead comparing [0,0,0] and [2].

*/

// Part 1 - find the number of pairs of bracketed expressions that are in the right order.
// Part 2.  - put all the supplied bracketed expressions into the right order, also including two more
// 'divider' bracketed numbers [[2]], [[6]]

// read an input file with promises
const fs = require("fs").promises;
const assert = require('assert');
const { constants } = require("perf_hooks");

const readlines = async() => {
    //const data = await fs.readFile('./testInput/day13_test.txt', {encoding: 'utf-8'});
    const data = await fs.readFile('day13_input.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    const blankLine = /\r\n\r\n|\r\r|\n\n/
    return data.split(blankLine).map(e => e.split(newLine)) 
    //return data.split(newLine)
};

const isOpenBracket = (str) => /^\[/.test(str)
const isClosedBracket = (str) => /^\]/.test(str)

assert(isOpenBracket('b[') === false, 'isOpenBracket test 1')
assert(isOpenBracket('[') === true, 'isOpenBracket test 2')
assert(isClosedBracket('a]') === false, 'isClosedBracket test 1')

const startsNumber = (str) => /^[0-9]+|^\,[0-9]+/.test(str)
assert(startsNumber('[556') === false, 'startsNumber test 1')
assert(startsNumber('78') === true, 'startsNumber test 2')

const getNumber = (str) => str.match(/([0-9]+)/)[0]
assert(getNumber('49') === '49', 'getNumber test 1')

//const hasNumber = (str) => str.match(/([0-9]+)/)
//assert(hasNumber(']]') === null, 'hasNumber test 1')

const toNextNumberOrBracket = (str) => {
    let idxBracket = str.length
    let idxString = str.length
    if (/\]/.test(str)) idxBracket = str.indexOf(']')
    if (/[0-9]+/.test(str)) {
        idxString = str.indexOf(getNumber(str)) // can't use indexOf with regex on a String
        + getNumber(str).length-1 //number may be more than 1 char
    }
    return Math.min(idxBracket, idxString)
}

assert(toNextNumberOrBracket('klt]') === 3, 'toNextNumberOrBracket test 1')
assert(toNextNumberOrBracket('[ukx79') === 5, 'toNextNumberOrBracket test 2')

const inBrackets = (chunkStr, brackets = ['[',']']) => {
/* extract the expression inside brackets */
    const chunk = chunkStr.split('')
    let bracketed = []
    let char = ''
    let openCount = 0
    let index = 0

    let finished = false
    while (!finished && index < chunk.length) {
        char = chunk[index] 
        if (chunk[index] === brackets[0]) {
            openCount += 1  
        } else if (chunk[index] === brackets[1]) {
            openCount -=1  
            if (openCount === 0) finished = true // stop when matching closing bracket reached
        } 
        if (openCount > 0 || finished) bracketed.push(char)  
        if (openCount < 0) {
            console.log('no matching bracket')
            return null //error
        }
        index = index+1  
    }

    return bracketed.join('')
}
assert(inBrackets('[a,[5,6,78],4]]h') === '[a,[5,6,78],4]', 'in brackets test 1')
assert(inBrackets('[[[7,8],5],[[9,[8,7,8],[],[2,4,10,10],[2,10,8,3,3]],[],[[6,1,10],[],3,6],[3]],[],[4],[3,0,1,10]]') === 
'[[[7,8],5],[[9,[8,7,8],[],[2,4,10,10],[2,10,8,3,3]],[],[[6,1,10],[],3,6],[3]],[],[4],[3,0,1,10]]', 'in brackets test 2')

const recurseCompare = (leftStr, rightStr, num) => {
    leftStr = leftStr.slice(1).slice(0,-1)  // remove outer brackets 
    rightStr = rightStr.slice(1).slice(0,-1)  // remove outer brackets  
    let result = null

    // stop condition - empty strings, no result
    if (rightStr === '' && leftStr === '') { 
        return null
    }
    // loop over left and right expressions, recursing for bracketed inner expressions
    while (leftStr.length > 0 || rightStr.length > 0) {

    //  Stop conditions 
    //1. next number on the left is higher than the next one on the right - incorrect
    //2. next number on the left is lower than the next one on the right - correct, and stop search
    while (startsNumber(leftStr) && startsNumber(rightStr)) {
        if (Number(getNumber(leftStr)) > Number(getNumber(rightStr))) {
            //console.log('returned false ', num, ' ',getNumber(leftStr) ,' is greater than', getNumber(rightStr))
            return false
        }
        if (Number(getNumber(leftStr)) < Number(getNumber(rightStr))) {
           // console.log('returned true ', num, ' ',getNumber(leftStr) ,' is less than', getNumber(rightStr))
            return true  // search stops here
        }
        leftStr = leftStr.slice(toNextNumberOrBracket(leftStr)+2)
        rightStr = rightStr.slice(toNextNumberOrBracket(rightStr)+2)
    }  
    // Stop conditions - 3. right has run out before left   
    if (rightStr === '' && leftStr !== '') {
        //console.log('returned false right side has run out first', num, ' ', leftStr, rightStr)
        return false // -only a close bracket left
    }
    // Stop conditions - 4. left has run out before right
    if (rightStr !== '' && leftStr === '') { 
        //console.log('returned true left side has run out first', num, ' ', leftStr, rightStr)
        return true 
    }
    // if both start with a bracket
    if (isOpenBracket(leftStr[0]) && isOpenBracket(rightStr[0])) {
        result = recurseCompare(inBrackets(leftStr), inBrackets(rightStr), num)
        if (result !== null) return result
        leftStr = leftStr.slice(inBrackets(leftStr).length+1)
        rightStr = rightStr.slice(inBrackets(rightStr).length+1)
    }
    // if only one part is bracketed, the other a number, enclose the number in brackets
    if (isOpenBracket(leftStr[0]) && startsNumber(rightStr)) {
        rightStr = '[' + getNumber(rightStr) + ']'
        result = recurseCompare(inBrackets(leftStr), rightStr, num)
        if (result !== null) return result
        leftStr = leftStr.slice(inBrackets(leftStr).length+1)
        rightStr = rightStr.slice(inBrackets(rightStr).length+1)
    } else if (isOpenBracket(rightStr[0]) && startsNumber(leftStr)) {
        leftStr = '[' + getNumber(leftStr) + ']'
        result = recurseCompare(leftStr, inBrackets(rightStr), num)
        if (result !== null) return result
        leftStr = leftStr.slice(inBrackets(leftStr).length+1) 
        rightStr = rightStr.slice(inBrackets(rightStr).length+1)  
    }
}
    return null // no result
}

const sum = (arr) => arr.reduce((a,b) => a + b, 0)

const solveIt  = async() => {
    const input = await readlines()
    //const result = input.map(e=>recurseCompare(e[0],e[1]))//.filter(f=>f===true).length
    return 'Part 1 ' + 
    sum(input.map((e,i) => recurseCompare(e[0],e[1],i+1))
        .map((e,i) => e === true ? i+1 : 0))  
}
// answer 6415 
solveIt().then(console.log)

const readlinesNoBlanks = async() => {
    //const data = await fs.readFile('./testInput/day13_test.txt', {encoding: 'utf-8'});
    const data = await fs.readFile('day13_input.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    return data.split(newLine).filter(d => d!== '')
};

const solveItPart2  = async() => {
    let input = await readlinesNoBlanks()
    const divider1 = '[[2]]'
    const divider2 = '[[6]]'
    // add the two 'divders' given into the input
    input.push(divider1, divider2)
    input.sort((a,b) => recurseCompare(a,b) ? -1 : 1)
    const result = (input.indexOf(divider1)+1)*(input.indexOf(divider2)+1)
    return 'Part 2 ' + result
}
solveItPart2().then(console.log)


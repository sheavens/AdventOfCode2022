// read an input file with promises
const fs = require("fs").promises;
const assert = require('assert')

const readlines = async() => {
    //const data = await fs.readFile('./testInput/day13_test2.txt', {encoding: 'utf-8'});
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

const hasNumber = (str) => str.match(/([0-9]+)/)
assert(hasNumber(']]') === null, 'hasNumber test 1')

const toNextNumberOrBracket = (str) => {
    return Math.max(str.indexOf('['),
        str.search(/[0-9]+/))
}

assert(toNextNumberOrBracket('klt[') === 3, 'toNextNumberOrBracket test 1')
assert(toNextNumberOrBracket(']ukx79') === 4, 'toNextNumberOrBracket test 2')

const inBrackets = (chunkStr, brackets = ['[',']']) => {
/* extract the expression inside brackets */
    const chunk = chunkStr.split('')
    let bracketed = []
    let char = ''
    let openCount = 0
    let index = 0

    let finished = false
    while (!finished && index < chunk.length-1) {
        char = chunk[index] 
        if (chunk[index] === brackets[0]) {
            openCount += 1  
        } else if (chunk[index] === brackets[1]) {
            openCount -=1  
            if (openCount === 0) finished = true // stop when matching closing bracket reached
        } 
        if (openCount > 0 || finished) bracketed.push(char)  
        index = index+1  
    }
    return bracketed.join('') 
}
assert(inBrackets('[a,[5,6,78],4]]h') === '[a,[5,6,78],4]', 'in brackets test 1')

const recurseCompare = (leftStr, rightStr, num) => {
    // strip off the first character - will be an open bracket
    leftStr = leftStr.slice(1)
    rightStr = rightStr.slice(1)  
    let result = null

    // loop over left and right expressions, recursing for bracketed inner expressions
    while (leftStr.length > 0 || rightStr.length > 0) {

    //  Stop conditions 
    //1. next number on the left is higher than the next one on the right - incorrect
    //2. next number on the left is lower than the next one on the right - correct, and stop search
    while (startsNumber(leftStr) && startsNumber(rightStr)) {
        if (Number(getNumber(leftStr)) > Number(getNumber(rightStr))) {
            console.log('returned false ', num, ' ',getNumber(leftStr) ,' is greater than', getNumber(rightStr))
            return false
        }
        if (Number(getNumber(leftStr)) < Number(getNumber(rightStr))) {
            console.log('returned true ', num, ' ',getNumber(leftStr) ,' is less than', getNumber(rightStr))
            return true  // search stops here
        }
        leftStr = leftStr.slice(toNextNumberOrBracket(leftStr)+1)
        rightStr = rightStr.slice(toNextNumberOrBracket(rightStr)+1)
    }  
    // Stop conditions - 3. right has run out before left
    //if (rightStr.length === 1  && leftStr.length > 1)  {
    
    if ((!hasNumber(rightStr) && hasNumber(leftStr)) || 
        (leftStr.length > 1 && rightStr.length === ']'))  {
        console.log('returned false right side has run out first', num, ' ', leftStr, rightStr)
        return false // -only a close bracket left
    }
    // Stop conditions - 4. left has run out before right
    //if (leftStr.length === 1  && rightStr.length > 1)  {

    if ((hasNumber(rightStr) && !hasNumber(leftStr)) ||
        (leftStr.length === ']'  && rightStr.length > 1))  {
        console.log('returned true left side has run out first', num, ' ', leftStr, rightStr)
        return true 
    }

    // just closed bracket
    if ((leftStr.length === 1  && !hasNumber(leftStr)) 
    || (rightStr.length === 1 && !hasNumber(rightStr))){
        return undefined
    }


    // if both start with a bracket
    if (isOpenBracket(leftStr[0]) && isOpenBracket(rightStr[0])) {
        result = recurseCompare(inBrackets(leftStr), inBrackets(rightStr), num)
        if (result !== undefined) return result
        leftStr = leftStr.slice(inBrackets(leftStr).length+1)
        rightStr = rightStr.slice(inBrackets(rightStr).length+1)
    }
    // if only one part is bracketed, the other a number, enclose the number in brackets
    if (isOpenBracket(leftStr[0]) && startsNumber(rightStr)) {
        result = recurseCompare(inBrackets(leftStr), '[' + getNumber(rightStr) + ']', num)
        if (result !== undefined) return result
        leftStr = leftStr.slice(inBrackets(leftStr).length+1)
        rightStr = rightStr.slice(toNextNumberOrBracket(rightStr).length+1)
    } else if (isOpenBracket(rightStr[0]) && startsNumber(leftStr)) {
        result = recurseCompare('[' + getNumber(leftStr) + ']', inBrackets(rightStr), num)
        if (result !== undefined) return result
        leftStr = leftStr.slice(toNextNumberOrBracket(leftStr).length+1)
        rightStr = rightStr.slice(inBrackets(rightStr).length+1)  
    }
}
    console.log('no result')
    return null // no result
}

const sum = (arr) => arr.reduce((a,b) => a + b, 0)

const solveIt  = async() => {
    const input = await readlines()
    return 'Part 1 ' + 
    sum(input.map((e,i) => recurseCompare(e[0],e[1],i+1))
        .map((e,i) => e === true ? i+1 : 0))  
}

solveIt().then(console.log)
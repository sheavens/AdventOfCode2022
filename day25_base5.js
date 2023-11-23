/* convert "SNAFU" encoded numbers to base 10 and add up.
code uses digits 2,1,0,-,== (where - and = are i1 and -1)
Code digits from right to left represent units, 5's, 25's ... (i.e. base 5)
*/

"use strict"
// 

// read an input file with promises
const fs = require("fs").promises;
const assert = require('assert');
const { reduce } = require("lodash");

const readlines = async() => {
    const data = await fs.readFile('day25_input.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    //const blankLine = /\r\n\r\n|\r\r|\n\n/
    //return data.split(blankLine).map(e => e.split(newLine)) 
    return data.split(newLine)
};

const testInput = [
'1=-0-2',
'12111',
'2=0=',
'21',
'2=01',
'111',
'20012',
'112',
'1=-1=',
'1-12',
'12',
'1=',
'122',]

const toBase5 = (char) => {
// adds 2 to each SNAFU character to turn it into base 5 
    switch(char) {
        case '=':
            return 0
            break;
        case '-':
            return 1
            break;
        case '0':
            return 2
            break;
        case '1':
            return 3
            break;
        case '2':
            return 4
            break;
        default:
          // code block
      }
}

const toSNAFU = (char) => {
// deduct 2 from each base5 char to get SNAFU
    switch(char) {
        case '0':
            return '='
            break;
        case '1':
            return '-'
            break;
        case '2':
            return '0'
            break;
        case '3':
            return '1'
            break;
        case '4':
            return '2'
            break;
        default:
          // code block
      }
}

const sumIt = (strArr) => strArr.reduce((a,b) => +a+(+b), 0)

const solveIt  = async() => {
    const input = await readlines()
    //const input = testInput
    console.log(input)
    // convert numbers from SNAU and total them.
    // - add 2 to each SNAFU digit to give a base5 number to work with, convert that to base 10, and deduct the part added earlier
    const base5 = input.map(e=>e.split('').map(i => toBase5(i)).join(''))
    const added = input.map(e => new Array(e.length).fill('2').join(''))
    const base10 = base5.map((e,i)=> parseInt(e, 5)- parseInt(added[i], 5))
    const total = sumIt(base10)
    // convert total to SNAFU code 
    // - add a base 5 numbe 222222..(length longer than needed), convert to base5, deduct two from ech digit into SNAFU
    const add = parseInt(new Array(total.toString().length + 10).fill(2).join(''), 5) // !! make sue number added 22222.. is longer than result in base 5
    const b5 = (total + add).toString(5)  // converted to base 5
    const SNAFU = b5.toString().split('').map(e => toSNAFU(e)).join('').replace(/^0+/, '') // trim leading zeros
    return 'Part 1 ' + SNAFU
}

// Part 1 =01-0-2-0=-0==-1=01 not correct

solveIt().then(console.log)

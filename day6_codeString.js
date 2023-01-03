// read an input file with promises
const fs = require("fs").promises;

const readlines = async() => {
    const data = await fs.readFile('day6_input.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    //const blankLine = /\r\n\r\n|\r\r|\n\n/
    //return data.split(blankLine).map(e => e.split(newLine)) 
    //return data.split(newLine)
    return data.split('')
};

const test1 = 'mjqjpqmgbljsphdztnvjfqwrcgsmlb' // 7
const test2 = 'bvwbjplbgvbhsrlpgdmjqwftvncz' //: first marker after character 5
const test3 = 'nppdvjthqldpwncqszvftbrmjlhg' //: first marker after character 6
const test4 = 'nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg' // first marker after character 10
const test5 = 'zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw' //: first marker after character 11

const repeatChars = (chars) => {
    if ((new Set(chars)).size === chars.length) return false
    return true
}

const solveIt  = async() => {
    const input = await readlines()
    //const input = test5.split('')
    let count = 0
    for (char of input) {
        count +=1
        if (count >= 4) {
            if (!repeatChars(input.slice(count-4,count))) {
                return 'Part1 ' + count
            }
        } 
    }
    return null
}

const solveItPart2  = async() => {
    const input = await readlines()
    //const input = test5.split('')
    let count = 0
    for (char of input) {
        count +=1
        if (count >= 14) {
            if (!repeatChars(input.slice(count-14,count))) {
                return 'Part2 ' + count
            }
        } 
    }
    return null
}

solveIt().then(console.log)
solveItPart2().then(console.log)
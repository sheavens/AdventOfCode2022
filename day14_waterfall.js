/* How many grains of sand will come to rest before the rest start to fall into the abyss below?
A sand grain falls vertically until it hits a wall, or another sand grain. 
Then it falls down to the left, if space free, if not down to the right..  If not stopped by a wall, 
or by sand, it will fall into the abyss. */ 

// read an input file with promises
const fs = require("fs").promises
const assert = require('assert')

const readlines = async() => {
    const data = await fs.readFile('day14_input.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    //const blankLine = /\r\n\r\n|\r\r|\n\n/
    //return data.split(blankLine).map(e => e.split(newLine)) 
    return data.split(newLine)
};


const testInput = [
'498,4 -> 498,6 -> 496,6',
'503,4 -> 502,4 -> 502,9 -> 494,9',
]

const getPtsAlongLine = ([x1,y1],[x2,y2]) =>{ // or start and end and deconstruct internally
/* return set of points between the start and end line values
this code assumes only horizontal, vertical or diagonal lines */
    let ptsArr = []
    let key = ''
    // horizontal line
    if (y1 === y2) {
        const xLow = x1 < x2 ? x1 : x2 
        const xHigh = x1 > x2 ? x1 : x2 
        for (let x = xLow; x < xHigh + 1; x = x + 1) { //includes the high end point
            //key = x.toString() + '_' + y1.toString() 
            ptsArr.push([x,y1]) //  this string will be used as a key for the point
        }
    } else if (x1 === x2) {
    // vertical line
        const yLow = y1 < y2 ? y1 : y2 
        const yHigh = y1 > y2 ? y1 : y2 
        for (let y = yLow; y < yHigh + 1; y = y + 1) {
            //key = x1.toString() + '_' + y.toString() 
            ptsArr.push([x1,y]) // the number of these points initially set to 0
        }   
    } else { // diagonal.
        const xIncrement = x2 > x1 ? 1 : -1
        const yIncrement = y2 > y1 ? 1 : -1
        let x = x1
        for (let y = y1, x = x1 ; y != y2; y = y + yIncrement, x = x + xIncrement) {
            // ... assumes 45 degree line
            //key = x.toString() + '_' + y.toString() 
            ptsArr.push([x,y]) // the number of these points initially set to 
        }
        //key = x2.toString() + '_' + y2.toString() 
        ptsArr.push([x2,y2])   // include the end point, reached when y = y2, after the loop ended
    }
    return ptsArr
}
//console.log('getPtsAlongLine', getPtsAlongLine([498,4],[498,6]))

const strPt = (pt = '3_6') => pt.split('_').map(e => Number(e))
const ptStr = (pt = [3,6]) => pt.join('_') 
//console.log('strPt', strPt())
//console.log('ptStr', ptStr())

const getLines = (pts=[[1,2],[1,6],[5,6]]) => {
/* given a series of points, connected one to the next by 
hoizontal, vertical or 45 degree diagonal lines, 
[pt1, pt2, pt3] return an array of the connecting lines [pt1,pt2],[pt2,pt3] */
    let lines = []
    for (let pt of pts) {
        for (let [index, value] of pt.entries()) {
            if (pt[index+1]) lines.push([pt[index],pt[index+1]])
        }
    }
    return lines
}
//console.log('getLines ', getLines())

const getPtSet = (lines = [[[3,7],[7,7]]]) => {
/* ToDO! restructure as two points: 1 line, not array of lines */
/* Given an array of [two points] on  horizontal, vertical or 45 degree diagonal lines, 
return the set of all the points on the lines, as strings 'x_y' */
    const ptSet = new Set()
    for (let line of lines) {
        ptArr = getPtsAlongLine(line[0],line[1])
        for (let pt of ptArr) {
            ptArr.map(e => ptSet.add(e.join('_')))
        }
    }
    return ptSet
}
//console.log('getPtSet ', getPtSet())

const getLowest = (ptSet = new Set(['4_5', '7_8', '3_9'])) => {
/* Input is a set of points as strings 'x_y'.  
Return the lowest y value as a number */
    return Math.max(...Array.from(ptSet).map(e => strPt(e)[1]))
}
//console.log('getLowest ', getLowest(), Math.max(getLowest()))
    
const down = (pt) => [pt[0],pt[1]+1]
const downLeft = (pt) => [pt[0]-1,pt[1]+1]
const downRight = (pt) => [pt[0]+1,pt[1]+1]
const lowestWall = (wallSet) => Math.max(array.from(wallSet).map(e => e.split('_')).map(e => e[1]))
const downFree = (pt, ballSet, wallSet) => !wallSet.has(ptStr(down(pt))) && 
                        !ballSet.has(ptStr(down(pt)))
const downRightFree = (pt, ballSet, wallSet) => !wallSet.has(ptStr(downRight(pt))) && 
                        !ballSet.has(ptStr(downRight(pt)))
const downLeftFree = (pt, ballSet, wallSet) => !wallSet.has(ptStr(downLeft(pt))) && 
                        !ballSet.has(ptStr(downLeft(pt)))

const moveSnowball = (pt, ballSet, wallSet, lowest) => {
    let stopped = false
    while (stopped === false && pt[1] < lowest) { 
        if (downFree(pt, ballSet, wallSet)) {
            pt = down(pt)
        } else if (downLeftFree(pt, ballSet, wallSet)) {
            pt = downLeft(pt)
        } else if (downRightFree(pt, ballSet, wallSet)) {
            pt = downRight(pt)
        } else {
        stopped = true
        ballSet.add(ptStr(pt)) 
        }
    }   
    return ballSet
}

const solveIt  = async() => {
    const input = await readlines()
    let ballSet = new Set()
    const startPt = [500,0]
    const clean = input.map(e => e.split('->').map(e => e.split(',').map(e => Number(e.trim()))))
    const wallSet = getPtSet(getLines(clean))
    let lowest = getLowest(wallSet)
    let lastSize = -1
    while (ballSet.size > lastSize) {
        lastSize = ballSet.size
        ballSet = moveSnowball(startPt, ballSet, wallSet, lowest)
    }
    return 'Part 1 ' + ballSet.size
}

solveIt().then(console.log)


const solveItPart2  = async() => {
    const input = await readlines()
    //const input = testInput
    let ballSet = new Set()
    const startPt = [500,0]  
    const clean = input.map(e => e.split('->').map(e => e.split(',').map(e => Number(e.trim()))))
    const wallSet = getPtSet(getLines(clean))
    let floorArr = []
    let lowest = 0
    lowest = getLowest(wallSet)

    lowest = lowest + 2 // Part 2 has floor 2 below lowest wall
    floorArr = getPtsAlongLine([startPt[0]-lowest-1,lowest],[startPt[0]+lowest+1,lowest]) // add floor, 2 below lowest wall
    floorArr.map(e => wallSet.add(e.join('_')))

    let lastSize = -1
    while (ballSet.size > lastSize) {
        lastSize = ballSet.size
        ballSet = moveSnowball(startPt, ballSet, wallSet, lowest+2)// part2 has floor 2 below lowest wall
    }
    return 'Part 2 ' + ballSet.size
}

solveItPart2().then(console.log)
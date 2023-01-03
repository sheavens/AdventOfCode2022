const testInput = [
'R 4',
'U 4',
'L 3',
'D 1',
'R 4',
'D 1',
'L 5',
'R 2',
]

const testInput2 = [
'R 5',
'U 8',
'L 8',
'D 3',
'R 17',
'D 10',
'L 25',
'U 20',
]

// read an input file with promises
const fs = require("fs").promises;

const readlines = async() => {
    const data = await fs.readFile('day9_input.txt', {encoding: 'utf-8'});
    //const testData = testInput2
    const newLine = /\r\n|\r|\n/
    //const blankLine = /\r\n\r\n|\r\r|\n\n/
    //return data.split(blankLine).map(e => e.split(newLine)) 
    //return testData.map(e=>e.trim().split(' '))
    return data.split(newLine).map(e=>e.trim().split(' '))
};

const getPt = (x,y) => ({x: x, y: y})
const getX = (pt) => pt.x
const getY = (pt) => pt.y

const getNextPt = (direction = 'R', fromPt=getPt(0,0)) => {
// return pt 1 cell from the fromPt in direction given
    if (direction === 'R') return getPt(getX(fromPt)+1, getY(fromPt))
    if (direction === 'L') return getPt(getX(fromPt)-1, getY(fromPt))
    if (direction === 'U') return getPt(getX(fromPt), getY(fromPt)-1)
    if (direction === 'D') return getPt(getX(fromPt), getY(fromPt)+1)
}
console.log('getNextPt ', getNextPt())

const manhattan = (pt1=getPt(0,0), pt2=getPt(-3,2)) => Math.abs(getX(pt1) - getX(pt2)) + Math.abs(getY(pt1) - getY(pt2))
//console.log('manhattan ', manhattan())

const distance = (pt1=getPt(0,0), pt2=getPt(-3,2)) => Math.max(Math.abs(getX(pt1) - getX(pt2)),Math.abs(getY(pt1) - getY(pt2)))
//console.log('distance ', distance())

const ptToStr = (pt) => [getX(pt),getY(pt)].join('_')

const moveTail = (headPt, tailPt) => {
/* If the tailPt is more than one unit distance from the head, 
move it one closer: horizontally, vertically, or diagonally(both) */
    if (distance(headPt, tailPt) >= 2) {
        if (getX(tailPt) < getX(headPt)) {
            tailPt = getNextPt('R', tailPt)
        } else if (getX(tailPt) > getX(headPt)) {
            tailPt = getNextPt('L', tailPt)
        }
        if (getY(tailPt) > getY(headPt)) {
            tailPt = getNextPt('U', tailPt)
        } else if (getY(tailPt) < getY(headPt)) {
            tailPt = getNextPt('D', tailPt)
        }
    }
    return tailPt  
} 

const solveIt  = async() => {
    const input = await readlines()
    let headPt = getPt(0,-4)
    let tailPt = getPt(0,-4)
    let direction
    const tailSet = new Set()
    tailSet.add(ptToStr(tailPt))
    for (const d of input) {
        direction = d[0]
        for (let m = 0; m < Number(d[1]); m++) {
            headPt = getNextPt(direction, headPt) 
            tailPt = moveTail(headPt, tailPt)
            tailSet.add(ptToStr(tailPt)) // at to set as strings  
        }
    }
    return 'Part 1 ' + tailSet.size
}

solveIt().then(console.log)

const range = (start, stop, step=1) => {
    const arrayLength = Math.floor(((stop - start) / step)) + 1;
    return [...Array(arrayLength).keys()].map(x => (x * step) + start);
}

const grid = {width: 20, height: 20, data: new Array(20*20).fill('.')}
const drawGrid = (headPt, tailPts, grid) => {
    const line = []
    for (let x of range(0, grid.height)) {
        for (let y of range(0, grid.width)) {
            if (x === headPt.x && y === headPt.y) {
                line.push('H')
                break
            } 
            for (let i of range(1, tailPts.length)) {
                if ( x === tailPts[i].x && y === tailPts[i].y ) {
                    line.push(i)
                    break
                }
            }
            line.push(grid.data[x*y])
        }
        console.log(line)
    }
}

const solveItPart2  = async() => {
    const input = await readlines()
    let headPt = getPt(0,-4)
    let tailPts = new Array(10).fill(getPt(0,-4))
    let direction
    const tailSet = new Set()
    tailSet.add(ptToStr(tailPts[0]))
    for (const d of input) {
        direction = d[0]
        for (let m = 0; m < Number(d[1]); m++) {
            headPt = getNextPt(direction, headPt) 
            for (let tail = 0; tail < 9; tail++) {
                if (tail === 0) {
                    tailPts[tail] = moveTail(headPt, tailPts[tail] )
                } else {
                    tailPts[tail] = moveTail(tailPts[tail-1], tailPts[tail] )
                }
                tailSet.add(ptToStr(tailPts[8])) // at to set as strings
            }
        //drawGrid(headPt, tailPts)   
        }
    }
    return 'Part 2 ' + tailSet.size
}

solveItPart2().then(console.log)
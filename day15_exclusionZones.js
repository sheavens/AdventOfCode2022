/* Find points where beacons cannot be.  Each scanner picks up one beacon,
and there acn be no other beacons at ot within the same manhattan distance from the scanner.
Part 1 find excluded points along a line.  Part 2 find excluded point within an area. */

// read an input file with promises
const fs = require("fs").promises;
const assert = require('assert')

const readlines = async() => {
    const data = await fs.readFile('day15_input.txt', {encoding: 'utf-8'});
    const newline = /\r\n|\r|\n/
    //const blankLine = /\r\n\r\n|\r\r|\n\n/
    //return data.split(blankLine).map(e => e.split(newLine)) 
    return data.split(newline)
};

const regex = /Sensor at x=(-*[0-9]+)\, y=(-*[0-9]+): closest beacon is at x=(-*[0-9]+), y=(-*[0-9]+)/


const testInput = [
'Sensor at x=2, y=18: closest beacon is at x=-2, y=15',
'Sensor at x=9, y=16: closest beacon is at x=10, y=16',
'Sensor at x=13, y=2: closest beacon is at x=15, y=3',
'Sensor at x=12, y=14: closest beacon is at x=10, y=16',
'Sensor at x=10, y=20: closest beacon is at x=10, y=16',
'Sensor at x=14, y=17: closest beacon is at x=10, y=16',
'Sensor at x=8, y=7: closest beacon is at x=2, y=10',
'Sensor at x=2, y=0: closest beacon is at x=2, y=10',
'Sensor at x=0, y=11: closest beacon is at x=2, y=10',
'Sensor at x=20, y=14: closest beacon is at x=25, y=17',
'Sensor at x=17, y=20: closest beacon is at x=21, y=22',
'Sensor at x=16, y=7: closest beacon is at x=15, y=3',
'Sensor at x=14, y=3: closest beacon is at x=15, y=3',
'Sensor at x=20, y=1: closest beacon is at x=15, y=3',
]

// increment a Map counting values
const addMap = (key, map, add=1) => {
    const value = +map.get(key)
    if (value) {
        map.set(key, value + add)
    } else {
        map.set(key, add)
    } 
    return map
}

const ptStr = (pt = [4,5]) => pt.join('_')
const strPt = (str = '4_5') => {
    console.log(str)
    return str.split('_').map(e => Number(e)) 
}

const manhattan = (pt1 = [0,1], pt2 = [4,8]) => Math.abs(pt2[0] - pt1[0]) + Math.abs(pt2[1] - pt1[1])
assert(manhattan() === 11, 'manhattan test')

const excludedSet = (sensorPt, beaconPt) => {
/* return the set of points at same distance or closer to sensor */
    sensorToBeacon = manhattan(sensorPt, beaconPt)
    excludedSet = new Set()
    let excludedStack = new Stack()
    excludedStack.push(sensorPt)

    while (excludedStack.length() > 0) {
        currentPt = excludedStack.pop()
        for (let pt of getNeighbours(currentPt).filter(pt => manhattan(sensorPt, beaconPt) <= sensorToBeacon)) {
            excludedSet.add(ptStr(pt))
            excludedStack.push(pt)
        }
    }
    return excludedSet
}

const excluded = (pt, scanner, beacon) => {
    if (manhattan(pt, scanner) <= manhattan(scanner, beacon)) return true
    return false
}

const solveIt  = async() => {
/* count the number of excluded points in the row where y=200000 */
//.. solve it backwards? take each point in the target row and
// find wheter it is closer to a scanner than the beacon for that scanner // 
    const input = await readlines()
    const y = 2000000
    //const input = testInput
    //const y = 10

    const excludedSet = new Set()
    let sx
    let sy
    let bx
    let by 
    let manh 
    let nearLines = []
    let leftmost = Infinity
    let rightmost = -1*Infinity
    // find the leftmost and rightmost points that could be excluded 
    for (let line of input) {
        // console.log(line.match(regex).slice(1,5).map(e => Number(e)))
        [sx,sy,bx,by] = line.match(regex).slice(1,5).map(e => Number(e))
        manh = manhattan([sx,sy],[bx,by])
        // only look at scanners with beacon withing within y range of target line 
        if ((sy + manh >= by) || (sy - manh <= by)) {
            nearLines = [...nearLines, line]
            if (leftmost > sx - manh) leftmost = sx - manh
            if (rightmost < sx + manh ) rightmost = sx + manh
        }
    }
    // make a set of all excuded points
    for (let x = leftmost; x <= rightmost; x++) {
        if (!excludedSet.has(ptStr([x,y]))) {
            for (let line of nearLines) {
                [sx,sy,bx,by] = line.match(regex).slice(1,5).map(e => Number(e))
                if ((ptStr([x,y]) !== ptStr([bx,by])) && excluded([x,y], [sx,sy], [bx,by])) excludedSet.add(ptStr([x,y]))
            }
        }
    }
    return 'Part 1 ' + excludedSet.size
}

//solveIt().then(console.log)

/* Part 2 - There is only one point solving this, so I am searching 1 manhattan distance
from the manhattan border of each scanner, within the search area, for a co-incident point */ 

//range functions
const range = (start, stop, step=1) => {
    const arrayLength = Math.floor(((stop - start) / step)) + 1;
    return [...Array(arrayLength).keys()].map(x => (x * step) + start);
}

const ptsInRange = ([xFrom, yFrom],[xTo,yTo], [[xMin,xMax],[yMin,yMax]]) => {
/* returns points between [xFrom, yFrom] and [xTo, yTo] 
and within the zone bounded by rectangle within xMin,xMax,yMin,Ymax */
    let ptSet = new Set()
    let x = xFrom
    let y = yFrom
    incX = xFrom < xTo ? 1 : -1
    incY = yFrom < yTo ? 1 : -1
    while (x !== xTo + incX) {
        if (x>= xMin && x<= xMax && y>= yMin && y<=yMax) ptSet.add(ptStr([x,y])) 
        x = x + incX
        y = y + incY
    }
    return ptSet  
}

const lineGradient = ([[x1, y1],[x2,y2]]) => {
    return ((y2 - y1) / (x2 - x1))
}
assert(lineGradient([[0,2],[2,6]]) === 2, 'test lineGradient')

const yIntercept = ([[x1, y1],[x2,y2]]) => {
    return (y1 - lineGradient([[x1, y1],[x2,y2]])*x1)
}
assert(yIntercept([[0,2],[2,6]]) === 2, 'test yIntercept')

const areCrossing = ([[x1,y1],[x2,y2]],[[x3,y3],[x4,y4]]) => {
    if ((x1 < x3 && x2 < x3 && x1 < x4 && x2 < x4) ||
        (x1 > x3 && x2 > x3 && x1 > x4 && x2 > x4) ||
        (y1 < y3 && y2 < y3 && y1 < y4 && y2 < y4) ||
        (y1 > y3 && y2 > y3 && y1 > y4 && y2 > y4) ) return false
    return true
}
assert(areCrossing([[7,-3],[17,7]],[[0,0],[20,0]]) === true, 'test areCrossing true') 
assert(areCrossing([[7,-3],[17,7]],[[4,6],[-2,15]]) === false, 'test areCrossing false') 

const inZone = (pt= [5,14], zone=[[0,20],[0,20]]) => {
    if ((pt[0] >= zone[0][0] && pt[0] <= zone[0][1]) && 
        (pt[1] >= zone[1][0] && pt[1] <= zone[1][1])) return true
    return false
}
assert(inZone() === true, 'test inZone true')
assert(inZone([-1,24],[[0,20],[0,20]]) === false, 'InZone test false')

const intersection = ([[x1,y1],[x2,y2]],[[x3,y3],[x4,y4]]) => {
    /* return the intersection point of two lines, or null if no intersection */
    if (!areCrossing([[x1,y1],[x2,y2]],[[x3,y3],[x4,y4]])) return null
    const m1 = lineGradient([[x1,y1],[x2,y2]])
    const c1 = yIntercept([[x1,y1],[x2,y2]])
    const m2 = lineGradient([[x3,y3],[x4,y4]])
    const c2 = yIntercept([[x3,y3],[x4,y4]])
    const x = (c2-c1)/(m1-m2)
    const y = m1*x + c1 
    return [x,y]
}

const intersect =([[x1,y1],[x2,y2]],[[x3,y3],[x4,y4]]) => {
/* Returns the coordinates of a point of intersection that lies within
the line segments, or null if no such intersection */
    const A1 = y2 - y1
    const B1 = x1 - x2
    const C1 = A1 * x1 + B1 *y1
    const A2 = y4 - y3
    const B2 = x3 - x4
    const C2 = A2 * x3 + B2 * y3
    const denom = A1 * B2 - A2 * B1  
    if (denom === 0) return null  // lines are parallel
    // co-ordinates of intersection point
    const x = (C1 * B2 - C2 * B1)/denom
    const y = (A1 * C2 - A2 * C1)/denom
    // test for intersection point lying within both segments 
    const min1 = Math.min(x1,x2)
    const max1 = Math.max(x1,x2)
    const max2 = Math.max(x3,x4)
    const min2 = Math.min(x3,x4)
    if (x >= min1 && x <= max1 &&
        (x >= min2 && x <= max2)) return [x,y]
    return null
}

console.log((intersect([[7,-3],[17,7]],[[0,0],[10,0]])))// === [10,0], 'test intersection')

//console.log((intersection([[7,-3],[17,7]],[[0,0],[10,0]])))// === [10,0], 'test intersection')

//assert(intersection([[7,-3],[17,7]],[[0,0],[10,0]])[0] === 10, 'test intersection')
        
const sectionInRange = (line, zone) => {
    /* returns the section of line that lies within the zone bounded  
    by rectangle [[xMin,xMax],[yMin,Ymax]], or empty if line wholly outside zone */
    const [pt1,pt2] = line
    const [x1, y1] = pt1
    const [x2, y2] = pt2
    const [[xMin,xMax],[yMin, yMax]] = zone
    let segment = []
    let intsect = []
    if (inZone(pt1, zone)) segment.push(pt1) 
    if (inZone(pt2, zone)) segment.push(pt2)
    if (segment.length < 2) { 
        intsect = intersect([pt1,pt2],[[xMin,Math.min(y1,y2)],[xMin,Math.max(y1,y2)]])
        if (intsect ) segment.push(intsect)
    }
    if (segment.length < 2) { 
        intsect = intersect([pt1,pt2],[[xMax,Math.min(y1,y2)],[xMax,Math.max(y1,y2)]])
        if (intsect ) segment.push(intsect)
    }
    if (segment.length < 2) { 
        intsect = intersect([pt1,pt2],[[Math.min(x1,x2),yMin],[Math.max(x1,x2),yMin]])
        if (intsect ) segment.push(intsect)
    }
    if (segment.length < 2) { 
        intsect = intersect([pt1,pt2],[[Math.min(x1,x2),yMax],[Math.max(x1,x2),yMax]])
        if (intsect ) segment.push(intsect)
    }
    console.log(line, segment)

    return segment
}

console.log(sectionInRange([[7,-3],[17,7]],[[0,20],[0,20]]))// === ([[10,0][17,7]] || [[17,7],[10,0]]), 'test ssctionInRange')

//assert(sectionInRange([[7,-3],[17,7]],[[0,20],[0,20]]) === ([[10,0][17,7]] || [[17,7],[10,0]]), 'test ssctionInRange')

const borderSet = (pt, manh, zone) => {
// find points in the XY delimited zone at the manhattan distance given from the input point
    let ptSet = new Set()
    // look at the 4 edges of the manhattan distance boundary from the pt
    // Points along the edge must also be within the zone
    
    // NE edge (N point to East point, x is column, y is row)
    let xFrom = (pt[0])
    let xTo = (pt[0] + manh)
    let yFrom = (pt[1] - manh)
    let yTo = (pt[1])
    // ToDo .. define shape as an array of lines.  
    // find intersections between shapes, filter to within bounds
    // count the num of exch intersection .. 
    // border zone bounds also make a shape?

    const NE = [[xFrom, yFrom],[xTo, yTo]]
    //ptSet = union(ptSet, ptsInRange([xFrom,yFrom],[xTo,yTo],zone))

    // NW edge (N to W point)
    xFrom = (pt[0])
    xTo = (pt[0] - manh)
    const NW = [[xFrom, yFrom],[xTo, yTo]]
    //ptSet = union(ptSet, ptsInRange([xFrom,yFrom],[xTo,yTo],zone))
   
    // SW edge (S to W point)
    yFrom = (pt[1] + manh)
    yTo = (pt[1])
    const SW = [[xFrom, yFrom],[xTo, yTo]]
    //ptSet = union(ptSet, ptsInRange([xFrom,yFrom],[xTo,yTo],zone))

    // SE edge (S to E point)
    xFrom = (pt[0])
    xTo = (pt[0] + manh)
    const  SE = [[xFrom, yFrom],[xTo, yTo]]

    //ptSet = union(ptSet, ptsInRange([xFrom,yFrom],[xTo,yTo],zone))

    return ptSet
}

const borderShapes = (pt, manh) => {
    // find points in the XY delimited zone at the manhattan distance given from the input point
        let ptSet = new Set()
        // look at the 4 edges of the manhattan distance boundary from the pt
        // Points along the edge must also be within the zone
        
        // NE edge (N point to East point, x is column, y is row)
        let xFrom = (pt[0])
        let xTo = (pt[0] + manh)
        let yFrom = (pt[1] - manh)
        let yTo = (pt[1])
        // ToDo .. define shape as an array of lines.  
        // find intersections between shapes, filter to within bounds
        // count the num of exch intersection .. 
        // border zone bounds also make a shape?
    
        const NE = [[xFrom, yFrom],[xTo, yTo]]
        //ptSet = union(ptSet, ptsInRange([xFrom,yFrom],[xTo,yTo],zone))
    
        // NW edge (N to W point)
        xFrom = (pt[0])
        xTo = (pt[0] - manh)
        const NW = [[xFrom, yFrom],[xTo, yTo]]
        //ptSet = union(ptSet, ptsInRange([xFrom,yFrom],[xTo,yTo],zone))
       
        // SW edge (S to W point)
        yFrom = (pt[1] + manh)
        yTo = (pt[1])
        const SW = [[xFrom, yFrom],[xTo, yTo]]
        //ptSet = union(ptSet, ptsInRange([xFrom,yFrom],[xTo,yTo],zone))
    
        // SE edge (S to E point)
        xFrom = (pt[0])
        xTo = (pt[0] + manh)
        const  SE = [[xFrom, yFrom],[xTo, yTo]]
    
        //ptSet = union(ptSet, ptsInRange([xFrom,yFrom],[xTo,yTo],zone))
    
        return [NE,NW,SE,SW]
    }
    

const solveItPart2  = async() => {
    /* count the number of excluded points in the row where y=200000 */
    //.. solve it backwards? take each point in the target row and
    // find wheter it is closer to a scanner than the beacon for that scanner // 
        const input = await readlines()
        const zoneMax = 4000000

        //const input = testInput // and zoneMax 20
        //const zoneMax = 20
        const zoneXRange = [0,zoneMax]
        const zoneYRange = [0,zoneMax]
        const zone = [zoneXRange, zoneYRange]
        let sx
        let sy
        let bx
        let by 
        let manh 
        let solnSets = []
        let solnPt = []
        let shape = []
        let shapes = []
        // find points within target zone at manhattan +1 from each scanner,
        // that exist in at least 4 sets
        for (let line of input) {
            [sx,sy,bx,by] = line.match(regex).slice(1,5).map(e => Number(e))
            manh = manhattan([sx,sy],[bx,by]) 
            shape = borderShapes([sx,sy], manh+1)
            //shape = shape.map(line => sectionInRange(line, zone)) // ignore lines wholly outside target zone
            //if (shape.length > 0) shapes.push(shape)
            shapes.push(shape)
            //solnSets.push(borderSet([sx,sy], manh+1, zone))          
        }
         
        let intersectPt
        let freqMap = new Map()
        for (let s = 0; s < shapes.length; s++) {
        //compare lines from all other shapes with this one and keep intersection points
            console.log(' working on shape ', s)
            for (let line of shapes[s]) { // compare each line with each line of each other shape
                for (let sc = 0; sc < shapes.length; sc++) {
                    if (sc === s) continue 
                    for (let ln of shapes[sc]) {
                        intersectPt = intersect(line,ln)
                        if (intersectPt && inZone(intersectPt, zone)) freqMap = addMap(ptStr(intersectPt), freqMap) // store frequency of this intersection
                    }    
                }
            }
        }
        let maxFreq = 0
        for (let [pt, freq] of freqMap) {
            if (freq > maxFreq) {
                maxFreq = freq
                solnPt = strPt(pt)
            }
        }


/*             for ( let pt of Array.from(solnSets[i])) {
                count = 0
                for (let j = 0; j < solnSets.length; j++) {
                    if (j === i) continue
                    if (solnSets[j].has(pt)) count++
                    if (count >= 4) {
                        console.log(count, pt)
                        solnPt = pt
                    }
                }
            } */
        /*  */

/*         let count
        for (let i = 0; i < solnSets.length; i++) {
            console.log(' working on set ', i)
            for ( let pt of Array.from(solnSets[i])) {
                count = 0
                for (let j = 0; j < solnSets.length; j++) {
                    if (j === i) continue
                    if (solnSets[j].has(pt)) count++
                    if (count >= 4) {
                        console.log(count, pt)
                        solnPt = pt
                    }
                }
            }
        } */
        const soln = (solnPt)[0]*4000000 + (solnPt)[1]
        return 'Part 2 ' + soln

        // return 'Part 2 ' + strPt(solnPt)[0]*zoneMax + strPt(solnPt)[1]
    }
    
    solveItPart2().then(console.log)
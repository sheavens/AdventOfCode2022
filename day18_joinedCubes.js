// Calculate the total exposed faced of a set of cubes, given cube centres

// read an input file with promises
const fs = require("fs").promises;
const assert = require('assert')

const readlines = async() => {
    const data = await fs.readFile('day18_input.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    //const blankLine = /\r\n\r\n|\r\r|\n\n/
    //return data.split(blankLine).map(e => e.split(newLine)) 
    return data.split(newLine).map(e => e.split(',').map(f => Number(f)))
};

testInput = [
[2,2,2],
[1,2,2],
[3,2,2],
[2,1,2],
[2,3,2],
[2,2,1],
[2,2,3],
[2,2,4],
[2,2,6],
[1,2,5],
[3,2,5],
[2,1,5],
[2,3,5],
]

const faces = (c=[1,2,3]) => {
    const [x, y, z] = c
    
    const s = new Set()
    s.add([x+0.5,y,z].join('_'))
    s.add([x-0.5,y,z].join('_'))
    s.add([x,y+0.5,z].join('_'))
    s.add([x,y-0.5,z].join('_'))
    s.add([x,y,z+0.5].join('_'))
    s.add([x,y,z-0.5].join('_'))
    
    return s

}
//console.log(faces())

const union = (setA, setB) => new Set([...setA, ...setB])

const difference = (setA, setB) => {
    // return set that are in SetA but not in Set B
    return new Set([...setA].filter(x => !setB.has(x)))
}

const intersection = (setA, setB) => {
    // rerurn set that are in both input sets
    return new Set([...setA].filter(x => setB.has(x)))
}

//one set fully contains another
const containsSet = (setA, setB)  => {
    const combined = union(setA, setB)
    const result = combined.size === setA.size || 
    combined.size === setB.size ? true : false
    return combined.size === setA.size || 
    combined.size === setB.size ? true : false
}

const faceSet = (cubeCentres) => {
    return cubeCentres.map(c => faces(c)).reduce((a,b) => union(a,b), new Set())
}

const solveIt  = async() => {
    const input = await readlines()
    //const input = testInput
    const allFaces = input.length*6
    const joinedFaces = allFaces - faceSet(input).size
    return 'Part 1 ' + (allFaces - 2 * joinedFaces) //1 joined face means 2 fewer exposed faces
}
solveIt().then(console.log)

const neighbours = (c=[1,2,3]) => {
    const [x, y, z] = c
    const s = new Set()
    s.add([x+1,y,z].join('_'))
    s.add([x-1,y,z].join('_'))
    s.add([x,y+1,z].join('_'))
    s.add([x,y-1,z].join('_'))
    s.add([x,y,z+1].join('_'))
    s.add([x,y,z-1].join('_'))
    
    return s

}
//console.log(neighbours())

const neighbourSet = (cubeCentres) => {
    return cubeCentres.map(c => neighbours(c)).reduce((a,b) => union(a,b), new Set())
}

const getBounds = (coordArr = [[1,2,3],[3,4,5],[13,18,20],[45,0,-1]]) => {
    let [xMin, yMin, zMin] = coordArr[0]
    let [xMax, yMax, zMax] = coordArr[0]
    for (let c of coordArr) {
        if (c[0] < xMin) xMin = c[0]
        if (c[0] > xMax) xMax = c[0]
        if (c[1] < yMin) yMin = c[1]
        if (c[1] > yMax) yMax = c[1]
        if (c[2] < zMin) zMin = c[2]
        if (c[2] > zMax) zMax = c[2]
    } 
    return [[xMin,xMax],[yMin,yMax],[zMin,zMax]]
}
//console.log(getBounds())

const inFreshAir = ([x,y,z]=[1,4,18], bounds=[[1,3],[4,7],[10,20]]) => {
    if (x < bounds[0][0]) return true 
    if (x > bounds[0][1]) return true
    if (y < bounds[1][0]) return true 
    if (y > bounds[1][1]) return true
    if (z < bounds[2][0]) return true 
    if (z > bounds[2][1]) return true
    return false 
}
assert(inFreshAir() === false, 'inFreshAir test 1')

const strPt = (str='2_1_3') => str.split('_').map(e=>Number(e))

// **Part2: Find the number of exposed faces; not including groups of internal cells not connected to outside air

// Block faces connected to other block faces reduce exposed facecount by 2 - as before
// Explore the set of absent neighbours and for each, their connected neighbours not in the block set
// If they have a face at the boundary limit x,y,z of all faces, they are on the outside, in fresh air
// Use a queue - queue neibours of each absent block to visit.  On visit, queue the neighbours where not in set of listed blocks 
// (note, may not be in absent block list either, for example for a large internal hole
// which includes cells not neighbouring listed blocks)
// If no connected block in fresh air is found, all connected blocks (not in block list) are in an internal air pocket

const solveItPart2  = async() => {
    const input = await readlines()
    //const input = testInput
    const allFaces = input.length*6
    const joinedFaces = allFaces - faceSet(input).size
    const inputSet = new Set(input.map(c=>c.join('_')))
    const absentNeighbourSet = difference(neighbourSet(input), inputSet)
    const bounds = getBounds(input)
    const toVisitQueue = []
    const visited = new Set()
    let pocketSet = new Set()
    let v 
    for (let a of absentNeighbourSet) {
        let connected = new Set()
        let exposedToAir = false
        toVisitQueue.push(a) //!! just start with a in queue - don't need the for loop a neighbours
        while (toVisitQueue.length > 0) {
            v = toVisitQueue.shift()
            // For cells in fresh air:
            // Do not add to visited set (may be needed again), 
            // but do not queue neighbours, to avoid cont. into empty space
            if (inFreshAir(strPt(v), bounds)) {
                exposedToAir = true
            } else {
                if (!inputSet.has(v) && !visited.has(v)) {
                    connected.add(v)
                    // add neighbours to toVisitQueue
                    toVisitQueue.push(...(Array.from(neighbours(strPt(v)))))
                    visited.add(v)
                }
            }
        }
        // add connectedSet to set of airpocket cells
        if (!exposedToAir) pocketSet = union(connected, pocketSet)
    }
    // faces of cells in airpockets that are in the input set are not exposed faces
    const pocketFaces = intersection(faceSet(Array.from(pocketSet).map(e=>strPt(e))), faceSet(input)).size 
    return 'Part 2 ' + (allFaces - 2 * joinedFaces - pocketFaces) //1 joined face means 2 fewer exposed faces
}
// answer 2520
solveItPart2().then(console.log)


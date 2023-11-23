/* Find the maximum pressure that can be released by opening valves, within a time limit. 
Vavles are connected in a network of paths, and pressure behind the valve is
released every minute for the remaining minutes left after opening it. 
*/

// read an input file with promises
const fs = require("fs").promises
const assert = require('assert');
const { isKeyObject } = require("util/types");

const readlines = async() => {
    const data = await fs.readFile('day16_input.txt', {encoding: 'utf-8'});
    //const data = await fs.readFile('./testInput/day16_test.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    //const blankLine = /\r\n\r\n|\r\r|\n\n/
    //return data.split(blankLine).map(e => e.split(newLine)) 
    return data.split(newLine)
};

// Valve [A-Z][A-Z]) has flow rate=([0-9]+); tunnels lead to valves* (([A-Z][A-Z]),*)*/
const letterRegex = /([A-Z][A-Z])/g
const numberRegex = /([0-9]+)/g

const printMatrix = (matrix={A:{a:1,b:2,c:0},
    B:{a:5,b:4,d:3},C:{a:7,b:9,d:-3},D:{a:0,f:8,d:27}}) => {
    Object.keys(matrix).forEach(i => {
        Object.keys(i).forEach(j => {
            console.log(matrix[i][j])
        })
    })
} 
//printMatrix()

const floydWarshallAlgorithm = (connections) => {
    // connections is an object of objects giving connected
    // nodes with weights (path cost): {'A': {B:1,C:1}, 'B':{A:0, C:1}}
    // Returns a similar structure with shortest path between
    // all nodes in place of weights.

    let dist = {}
    // initialise distances of directly connected nodes to connection costs
    Object.keys(connections).forEach(from => {
        dist[from] = {}
        Object.keys(connections[from]).forEach(to => {
            dist[from][to] = connections[from][to] 
        })
    })
    // Set initial distances between other nodes (not directly connected), to Infinity
    Object.keys(connections).forEach(from => {
        Object.keys(connections).forEach(to => {
            if (dist[from][to] === undefined) {
                dist[from][to] = Infinity
            } 
            if (from === to) {
                dist[from][to] = 0 // ensure self connection cost 0 
            }
        })
    })
    // If distance via another route is shorter, replace distance .. of O(n^3) complexity
    Object.keys(dist).forEach(intermediate => {
        Object.keys(dist).forEach(from => {  
            Object.keys(dist).forEach(to => {
                if (dist[from][intermediate] + dist[intermediate][to] < dist[from][to]) {
                    dist[from][to] = dist[from][intermediate] + dist[intermediate][to]
                }
            })
        })
    })
    //printMatrix(dist)
    return dist;
}

const recurseValves = (valve='AA', minutes, valvesToOpen, pressure, shortestPaths) => {
/* recursive solver trying all options of valve opening srquence to find the best one.
at each valve, moves to each other valve yet to open, via shortest path, and recurse.*/ 
// stop when time runs out
    if (minutes <= 0) {
        return 0
    }
// stop when no more valves left to open 
    if (valvesToOpen.length === 0) {
        return 0
    }
    let bestScore = 0
    let score = 0
    let timeToOpen
// try each of remaining valvesToOpen as next valve
    for (let v of valvesToOpen) {
        timeToOpen = shortestPaths[valve][v] + 1 //path time + 1 minute to open it
        if (minutes >= timeToOpen) {
            score = (minutes-timeToOpen)*pressure[v] 
            + recurseValves(v, minutes-timeToOpen, 
                valvesToOpen.filter(e => e!==v), pressure, shortestPaths)
            if (score > bestScore) bestScore = score
        }
    }
    return bestScore
}

const solveIt  = async() => {
    const input = await readlines()
    let p
    let v
    let valvesToOpen = []
    let pressure = {}
    let connections = {}
    for (let line of input) {
        p = line.match(numberRegex)
        v = line.match(letterRegex)
        if (Number(p[0]) > 0) {
            valvesToOpen.push(v[0])
            pressure[v[0]] = Number(p[0])
        }
        connections[v[0]] = {}
        for (let i = 1; i < v.length; i++) {
            connections[v[0]][v[i]] = 1          
        }
    }
    const shortestPaths = floydWarshallAlgorithm(connections)
    const bestScore = recurseValves('AA', 30, valvesToOpen, pressure, shortestPaths)
    return 'Part 1 ' + bestScore
}
solveIt().then(console.log)

const recurseValvesPart2 = (me=true, myValve='AA', elValve='AA', myMinutes, elMinutes, valvesToOpen, pressure, shortestPaths, memo=new Map(), level=0) => {
/* recursive solver trying all options to find the best one.
at each valve, moves to each other valve yet to open, via shortest path, and recurse.*/ 
// stop when the one opening the valve has no time left
    if (me && myMinutes <= 0){
        return null
    }
    if (!me && elMinutes <=0) {
        return null
    }
// stop when no more valves left to open 
    if (valvesToOpen.length === 0) {
        return 0
    }

// key to memoise it.  (symmetric for my or elephant position, so one saved key can be one of two equivalent cases..)
const key1 = myValve+elValve+myMinutes+elMinutes+valvesToOpen.join('')
const key2 = elValve+myValve+elMinutes+myMinutes+valvesToOpen.join('')

// YES!!!!! - did not hang at 8m memo entries when memo was changed from an object to a map!
if (memo.has(key1)) {
    return memo.get(key1)
}
if (memo.has(key2)) {
    return memo.get(key2)
}
    let score = 0
    let bestScore = 0
    let myTimeToOpen
    let myScore
    let elTimeToOpen  // takes me and the elephant diff. times to open the next valve, becuase start points differ
    let elScore
    // try each of remaining valvesToOpen as next valve
    for (let v of valvesToOpen) {
        myTimeToOpen = shortestPaths[myValve][v] + 1 //path time + 1 minute to open it
        elTimeToOpen = shortestPaths[elValve][v] + 1 
        myScore = (myMinutes-myTimeToOpen)*pressure[v] 
        elScore = (elMinutes-elTimeToOpen)*pressure[v] 
        // two recursive paths - either I or the elephant will open the next valve

        // This code is trying all the possible valve sequences .. for a given
        // sequence, in order that the next listed valve is opened next, the helper
        // who can get there next in time (will also be higher scoring) will open it.
        
        // try the next valve opened by me, or opened by the elephant.  Memoise results 
        
    if (myScore >= elScore) { //I was not convinced by this algoritm! .. but it gave the right answer of 2400!  
    // I got a higher answer (of 2673) without this constraint. (but with me always making first move, as symmetric anyway).. 
        const meNext = recurseValvesPart2(true, v, elValve, myMinutes-myTimeToOpen, elMinutes,
                valvesToOpen.filter(e => e!==v), pressure, shortestPaths, memo, level=level+1)
        if (meNext !== null) {
            score = myScore + meNext
            if (score > bestScore) bestScore = score
        }
    } else {
        const elephantNext = recurseValvesPart2(false, myValve, v, myMinutes, elMinutes-elTimeToOpen,
            valvesToOpen.filter(e => e!==v), pressure, shortestPaths, memo, level=level+1)
        if (elephantNext !== null) {
                score = elScore + elephantNext 
                if (score > bestScore) bestScore = score
        }  
        }             
    }
    if (bestScore > 2166) console.log(bestScore, myMinutes, elMinutes, memo.size)
    //if (Object.keys(memo).length%1000000 === 0) console.log('!!!',Object.keys(memo).length)
    memo.set(key1,bestScore)
   // memo[key2] = bestScore .. don't need to store key2 (get it from key1 on checking.)  !! This one change allowed the prog to run further.  The size of the memeo is an issue
    // but program hangs after memo reaches c 8m entries
    return bestScore
}

const solveItPart2  = async() => {
/* an elephant is now helping open valves, with both he and myself having
26 minutes to open valves. */
    const input = await readlines()
    let p
    let v
    let valvesToOpen = []
    let pressure = {}
    let connections = {}
    for (let line of input) {
        p = line.match(numberRegex)
        v = line.match(letterRegex)
        if (Number(p[0]) > 0) {
            valvesToOpen.push(v[0])
            pressure[v[0]] = Number(p[0])
        }
        connections[v[0]] = {}
        for (let i = 1; i < v.length; i++) {
            connections[v[0]][v[i]] = 1          
        }
    }
    const shortestPaths = floydWarshallAlgorithm(connections)
    const bestScore = recurseValvesPart2(true, 'AA','AA', 26, 26, valvesToOpen, pressure, shortestPaths)
    return 'Part 2 ' + bestScore
}
solveItPart2().then(console.log)

/* Part 2 is taking too long - not solving.  Maybe size no longer computable
2^Valves more choices I think.
Reduce computation by cutting off early when the remaining valves to open cannot produce
a better answer than already found.  To do this will need to pass down the stack
the best result so far and result so far in this sequence, 
and apply a heuristic against the remaining valves to open - perhaps 2 minutes 
(min transit aand opening time for each valve pressure released in size order).
Also order the valves by pressure to start with, to get a good result early.
*/

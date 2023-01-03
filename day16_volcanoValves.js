// read an input file with promises
const fs = require("fs").promises
const assert = require('assert')

const readlines = async() => {
    const data = await fs.readFile('./testInput/day16_test.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    //const blankLine = /\r\n\r\n|\r\r|\n\n/
    //return data.split(blankLine).map(e => e.split(newLine)) 
    return data.split(newLine)
};


// Valve [A-Z][A-Z]) has flow rate=([0-9]+); tunnels lead to valves* (([A-Z][A-Z]),*)*/
const letterRegex = /([A-Z][A-Z])/g
const numberRegex = /([0-9]+)/g

const addToMapObj = (mapKey, map, objectKey, objectValue) => {
    // add to an object within a map
      const obj = map.get(mapKey)
      if (obj) {
          obj[objectKey] = objectValue
          map.set(mapKey, obj)
      } else {
          map.set(mapKey, {[objectKey]:objectValue})
      } 
      return map
  }

  const addToMapObjArr = (mapKey, map, objectKey, objectValue) => {
    // add to an array within a map of objects
      const obj = map.get(mapKey)
      if (obj) {
          if (obj[objectKey]) {
            obj[objectKey] = [...obj[objectKey], objectValue]
          } else {
            obj[objectKey] = [objectValue]
          }
          map.set(mapKey, obj)
      } else {
          map.set(mapKey, {[objectKey]:[objectValue]})
      } 
      return map
  }

  const addToMapArr = (mapKey, map, arrValue) => {
    // add to an array within a map
      const arr = map.get(mapKey)
      if (arr) {
          arr.push(arrValue)
          map.set(mapKey, arr)
      } else {
          map.set(mapKey, [arrValue])
      } 
      return map
  }

const recurseValves = (valve, minutes, valveMap, score=0, from=null) => {
/* recursive solver trying all options to find the best one.
at each move, can either open the current valve or not, and then move to next */
    console.log(valve, score, minutes, valveMap.get(valve).state)    
// stop when time runs out
    if (minutes === 0) {
        return score
    }

    let bestScore = 0
    
    // try both opening this valve, and not opening it (takes 1 minute less), and move to a connected one.
    let connected = valveMap.get(valve).connected
    if (from !== null) connected = connected.filter(c => c !== from) // don't turn back if no valves have been opened since last turn
    if (connected.length === 0) return score // no where to go
    for (let v of connected) {
    /* // keep track of where have been before from here, with the destination valve open and closed
        if (!pathTravelled.get(v)) pathTravelled.set(v, {'open': [], 'closed': []})

        if (valveMap.get(v).state === 'closed') {
            if (pathTravelled.get(v).closed.includes(valve)) continue   
            addToMapObjArr(v, pathTravelled, 'closed', valve)
        }
        if (valveMap.get(v).state === 'open') {
            if (pathTravelled.get(v).open.includes(valve)) continue   
            addToMapObjArr(v, pathTravelled, 'open', valve)
        }
    */

    // Two recursive paths from here..
    // open the valve (only if closed and has pressure) and move on to next
        if (valveMap.get(v).state === 'closed' && valveMap.get(v).pressure > 0 && minutes > 1) { 
            // score increments by the pressure released at this valve * minutes remaining
            score = recurseValves(v, minutes-2, addToMapObj(v, valveMap, 'state', 'open'), score+=valveMap.get(v).pressure * (minutes-2), from=null) // two minutes taken
            if (score > bestScore) bestScore = score
        }
    // don't open the valve and move on to next
        score = recurseValves(v, minutes-1, valveMap, score, from=valve) // 1 minute taken, no advance on score
        if (score > bestScore) bestScore = score
    }
    return bestScore  // after trying all options, return the best score
}

const solveIt  = async() => {
    const input = await readlines()
    let valveMap = new Map()  // holds valve state and valve constants
    let p
    let v
    for (let line of input) {
        // valveMap object v : {state: 'closed', pressure: p, connected: [v1, v2...]}
        p = line.match(numberRegex)
        v = line.match(letterRegex)
        valveMap = addToMapObj(v[0], valveMap, 'pressure', Number(p[0]))
        valveMap = addToMapObj(v[0], valveMap, 'state', 'closed')
        for (let i = 1; i < v.length; i++) {
            valveMap = addToMapObjArr(v[0], valveMap, 'connected', v[i])
        }
    }
    const bestScore = recurseValves('AA', 30, valveMap)
    return 'Part 1 ' + bestScore
}
solveIt().then(console.log)
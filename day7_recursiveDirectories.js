// read an input file with promises
const fs = require("fs").promises;

const readlines = async() => {
    //const data = await fs.readFile('./testInput/day7_test.txt', {encoding: 'utf-8'});
    const data = await fs.readFile('day7_input.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    //const blankLine = /\r\n\r\n|\r\r|\n\n/
    //return data.split(blankLine).map(e => e.split(newLine)) 
    return data.split(newLine)
};

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

const getKeysWithValue = (targetValue, map) => {
/ * From a Map input, returns an array of keys where the value matches a target value */
    let arr = new Array();
    for (let [key, value] of map) {
        if (value === targetValue)
            arr.push(key);
    }
    return arr
}

 
const topLevel = (line) => /cd\s+\//.test(line)
//console.log('topLevel ', topLevel('cd  /'))

const levelBelow = (line) => {
    const matched = line.match(/dir\s+([a-zA-Z]+)/)
    if (matched) return matched[1]
    return null
}
//console.log('levelBelow ', levelBelow('dir e'))

const downLevel = (line) => {
    const matched = line.match(/cd\s+([a-zA-Z]+)/)
    if (matched) return matched[1]
    return null
}
//console.log('downLevel ', downLevel(' cd ..'))
//console.log('downLevel ', downLevel(' cd e'))

const upLevel = (line) => /cd\s+\.\./.test(line)
//console.log('upLevel ', upLevel(' cd ..'))

const leafValue = (line) => {
    const matched = line.match(/(\d+)/)
    if (matched) return Number(matched[1])
    return null
}
//console.log('leafValue ', leafValue('34567 f'))

const leafFunc = (level, leafMap, leafValue) => addMap(level, leafMap, leafValue) // leaf values are just summed here

const buildTree = (input) => {
/* store the tree as a map of 'roots' {level: root} and 'leaves' {level: func(leaves)} */
    
    let level = 'top'
    let rootMap = new Map()
    let leafMap = new Map()
    rootMap.set('top', null)
    
    for (line of input) {
        if (topLevel(line)) {
            level = 'top'
        } else if (levelBelow(line)) {
            rootMap.set(levelBelow(line), level)
        } else if (downLevel(line)) {
            level = downLevel(line)
        } else if (leafValue(line)) {
            rootMap.set(leafValue(line).toString(), level)// leafFunc(level, leafMap, leafValue(line))
        } else if (upLevel(line)) {
            level = rootMap.get(level)
        }

/*         if (levelBelow(line)) rootMap.set(levelBelow(line), level)
        if (downLevel(line)) level = downLevel(line)
        if (leafValue(line)) leafMap = leafFunc(level, leafMap, leafValue(line))
        if (upLevel(line)) level = rootMap.get(level) */

    }
    return rootMap
}

const recurseTree = (root, rootMap) => {
/* rootMap is a map for each tree value (key) of its root (value) 
leafmap is for each tree level the value of the leaves (- here the sum of leaf values used) */
    const subLevels = getKeysWithValue(root, rootMap)
    // baseCase - this is a leaf
    if (leafValue(root)) { 
        return {total:leafValue(root), belowLimit:0}
    }    

    // return the leaf value of
// !! ToDo make leafmap show an array of the leaves - more generic   
  // loop over all branches/leaves in the treefrom the root
  let returned
  let total = 0
  let limitTotal = 0
  for (let subLevel of subLevels) {

  // if this has subtree, recurse tree, otherwise add the leaf value

    //if (leafValue(subLevel)) {
       // total = total + leafValue(subLevel)
    //} else {
        returned = recurseTree(subLevel, rootMap)
        total = total + returned.total
        limitTotal = limitTotal + returned.belowLimit
    //} 

  }
  
  
  if (total <= 100000) limitTotal  = limitTotal + total
  console.log('total limitTotal', total, limitTotal)
  return {total:total, belowLimit:limitTotal}
}

const solveItOld  = async() => {
    const input = await readlines()
    const [rootMap, leafMap] =buildTree(input)
    const rootIterator = rootMap.keys()
    let nextRoot = rootIterator.next().value
    let total = 0
    let sumTotal = 0
    while (nextRoot) {
         total = recurseTree({rootMap, leafMap}, nextRoot)
         if (total <= 100000) sumTotal = sumTotal + total
         console.log(sumTotal, nextRoot)
        nextRoot = rootIterator.next().value
    }
    return 'Part 1 ' + sumTotal
}

const solveIt  = async() => {
    const input = await readlines()
    const {total, belowLimit} = recurseTree('top', buildTree(input))
    return 'Part 1 ' + belowLimit
}


solveIt().then(console.log)
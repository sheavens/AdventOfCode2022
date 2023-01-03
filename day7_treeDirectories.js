/* From an input of a log of a tree of directories being traversed, 
(e.g commands cd X, ls, cd.., and output directory listings), find the sum
of sizes directories and sub-directories that lie below a limit given (Part 1)
and the smallest directory above a limit (Part 2). 
Initial solution failed on the real data, because had assumed unique directory names
(in fact, directories may contain names used in other directories)
..Here used a formally defined Tree class, with unique numbers for directories, 
to build up the tree.  */ 

// read an input file with promises
const fs = require("fs").promises;

const readlines = async() => {
    // const data = await fs.readFile('./testInput/day7_test.txt', {encoding: 'utf-8'});
    const data = await fs.readFile('day7_input.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    //const blankLine = /\r\n\r\n|\r\r|\n\n/
    //return data.split(blankLine).map(e => e.split(newLine)) 
    return data.split(newLine)
};

class TreeNode {
  constructor(key, value = key, parent = null) {
    this.key = key;
    this.value = value;
    this.parent = parent;
    this.children = [];
  }

  get isLeaf() {
    return this.children.length === 0;
  }

  get hasChildren() {
    return !this.isLeaf;
  }
}
  
class Tree {
  constructor(key, value = key) {
    this.root = new TreeNode(key, value);
  }

  *preOrderTraversal(node = this.root) {
    yield node;
    if (node.children.length) {
      for (let child of node.children) {
        yield* this.preOrderTraversal(child);
      }
    }
  }

  *postOrderTraversal(node = this.root) {
    if (node.children.length) {
      for (let child of node.children) {
        yield* this.postOrderTraversal(child);
      }
    }
    yield node;
  }

  insert(parentNodeKey, key, value = key) {
    for (let node of this.preOrderTraversal()) {
      if (node.key === parentNodeKey) {
        node.children.push(new TreeNode(key, value, node));
        return true;
      }
    }
    return false;
  }

  remove(key) {
    for (let node of this.preOrderTraversal()) {
      const filtered = node.children.filter(c => c.key !== key);
      if (filtered.length !== node.children.length) {
        node.children = filtered;
        return true;
      }
    }
    return false;
  }

  find(key) {
    for (let node of this.preOrderTraversal()) {
      if (node.key === key) return node;
    }
    return undefined;
  }
}

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

//const leafFunc = (level, leafMap, leafValue) => addMap(level, leafMap, leafValue) // leaf values are just summed here

const buildTree = (input) => {
/* store the tree as a map of 'roots' {level: root} and 'leaves' {level: func(leaves)} */
    
    let level = '1'
    const tree = new Tree('1', 'top')
    
    let n = 1
    for (let line of input) {
        if (topLevel(line)) {
            level = '1'
        } else if (levelBelow(line)) {
            tree.insert(level, level+n, levelBelow(line))
            n = n + 1
        } else if (downLevel(line)) {
            level = tree.find(level).children.filter(e => e.value===downLevel(line))[0].key
            n = 1
        } else if (leafValue(line)) {
            tree.insert(level, level+n, leafValue(line).toString())
            n = n + 1         
        } else if (upLevel(line)) {
            level = tree.find(level).parent.key
        }
    }
    return tree
}

const recurseTree = (node, tree, limit) => {
/* rootMap is a map for each tree value (key) of its root (value) 
leafmap is for each tree level the value of the leaves (- here the sum of leaf values used) */
    const subLevels = node.children
    // baseCase - this is a leaf
    if (leafValue(node.value)) { 
        return {total:leafValue(node.value), belowLimit: 0}
    }        
  // loop over all branches/leaves in the tree from the root
  let returned
  let total = 0
  let limitTotal = 0
  for (let subLevel of subLevels) {
        returned = recurseTree(subLevel, tree)
        total = total + returned.total
        // limitTotal adds in all subdireectories below the limit size, and this one (directories may be counted more than once)
        limitTotal = limitTotal + returned.belowLimit
  }
  
  if (total <= 100000) limitTotal  = limitTotal + total
  // console.log('total limitTotal', node.value, total, limitTotal)
  return {total:total, belowLimit:limitTotal}
}

const solveIt  = async() => {
const input = await readlines()
    const tree = buildTree(input)
    const {total, belowLimit} = recurseTree(tree.find('1'), tree) // key of root node is '1'
    return 'Part 1 ' + belowLimit
}

solveIt().then(console.log)

const recurseTreePart2 = (node, tree, spaceNeeded, smallestAbove = Infinity) => { //
  /* rootMap is a map for each tree value (key) of its root (value) 
  leafmap is for each tree level the value of the leaves (- here the sum of leaf values used) */
    const subLevels = node.children
    // baseCase - this is a leaf
    if (leafValue(node.value)) { 
        return {total:leafValue(node.value), smallestAbove: smallestAbove}
    }        
    // loop over all branches/leaves in the tree from the root
    let returned
    let total = 0
    for (let subLevel of subLevels) {
          // smallestAbove is being passed down to other tree branches
          returned = recurseTreePart2(subLevel, tree, spaceNeeded, smallestAbove)
          total = total + returned.total
          if (total >= spaceNeeded) {
            // .. and reset if beaten on the way up from any branch
            smallestAbove = Math.min(total, returned.smallestAbove)
          }
    }
  
    //console.log('total smallestAbove', node.value, total, smallestAbove)
    return {total: total, smallestAbove:smallestAbove}
  }
  
  
const solveItPart2  = async() => {
  // total disk space needed is 30000000 less total unused now
  // part 2 find smallest directory >= this size
  
  //const spaceNeeded = 30000000 - (70000000 - 48381165) 
  // Fopr test case 483..is total size now used, 700.. total available and 300.. required
  const spaceNeeded = 30000000 - (70000000 - 44359867) 
  
  const input = await readlines()
      const tree = buildTree(input)
      const {total, smallestAbove} = recurseTreePart2(tree.find('1'), tree, spaceNeeded) // key of root node is '1'
      return 'Part 2 ' + smallestAbove
  }
  
solveItPart2().then(console.log)
  
"use strict"
/* Find the maximum number of geodes that can be broken in a timelimit of 24 minutes.
geode-cracking robots break geodes.  These Robots are made from clay and ore,
which are collected by clay robots and ore robots.  Clay robots are made from ore.
Each type of robot can collect 1 unit of its product per minute.  It takes one minute to 
make a robot from its constituents.  You start with one ore-collecting robot. 

A number of different blueprints are available, e.g:
Blueprint 1:
  Each ore R costs 4 ore.
  Each clay R costs 2 ore.
  Each obsidian R costs 3 ore and 14 clay.
  Each geode R costs 2 ore and 7 obsidian.

Blueprint 2:
  Each ore R costs 2 ore.
  Each clay R costs 3 ore.
  Each obsidian R costs 3 ore and 8 clay.
  Each geode R costs 3 ore and 12 obsidian. 
  */

  /* For a given blueprint, at each timestep, collect 1 unit of relevant product with 
  each of the the Robots in operation and make another Robot of any one type, 
  if the ingredients (specified in the Blueprint) are in stock.
  The ingredients are consumed at the start of the build, and the new Robot becomes operational at the next timestep.
  Recursive planned.  To do this, will need to know
  the stock of product available - pass it down the stack.  End when
  time is up. Return the best geode number produced from each sequence of choices of Robot
  to build next.  Recusive execution here;  from the bottom of the stack return the geode stock and keep the best total going back up ..
  In part 2, only the first 3 Blueprints from a list of Blueprints are used, the time limit increased to 32 minutes, and the output
  required is the product of the maximum number of geodes from each Blueptint. */

  const _ = require("lodash")
  const obj = {a:3,b:3,c:7}
  console.log(_.values(obj))

  const capitalizeFirstName = (name) => {
    const result = capitalize(name);
    console.log(response);
  };

// read an input file with promises
const fs = require("fs").promises
const assert = require('assert');
const { TLSSocket } = require("tls");

const readlines = async() => {
    const data = await fs.readFile('day19_input.txt', {encoding: 'utf-8'});
    //const data = await fs.readFile('./testInput/day16_test.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    //const blankLine = /\r\n\r\n|\r\r|\n\n/
    //return data.split(blankLine).map(e => e.split(newLine)) 
    return data.split(newLine)
};

const testInput =  ['BluePrint 1. Each ore R costs 4 ore. Each clay R costs 2 ore. Each obsidian R costs 3 ore and 14 clay. Each geode R costs 2 ore and 7 obsidian.']
const testInput2 =  ['BluePrint 2. Each ore R costs 2 ore. Each clay R costs 3 ore. Each obsidian R costs 3 ore and 8 clay. Each geode R costs 3 ore and 12 obsidian.']

//Blueprint 17: Each ore R costs 4 ore. Each clay R costs 4 ore. Each obsidian R costs 2 ore and 12 clay. Each geode R costs 3 ore and 15 obsidian.
const numberRegex = /([0-9]+)/g

const haveStock =  (buildReq, stock) => {
  if (stock.ore < buildReq.ore) return false
  if (stock.cly < buildReq.cly) return false
  if (stock.obn < buildReq.obn) return false
  return true
}

const newStk =  (buildReq, robots, stock) => {
  let newStock = {}
    newStock.ore = buildReq.ore ? stock.ore - buildReq.ore : stock.ore
    newStock.cly = buildReq.cly ? stock.cly - buildReq.cly : stock.cly
    newStock.obn = buildReq.obn ? stock.obn - buildReq.obn : stock.obn
    newStock.geo = stock.geo
    newStock.ore = robots.ore ? newStock.ore + robots.ore : newStock.ore
    newStock.cly = robots.cly ? newStock.cly + robots.cly : newStock.cly
    newStock.obn = robots.obn ? newStock.obn + robots.obn : newStock.obn
    newStock.geo = robots.geo ? newStock.geo + robots.geo : newStock.geo
  return newStock
}

const buildStock =  (robots, stock) => {
  let newStock = {}
    newStock.ore = stock.ore + robots.ore
    newStock.cly = stock.cly + robots.cly
    newStock.obn = stock.obn + robots.obn
    newStock.geo = stock.geo + robots.geo 
  return newStock
}

const newRbts = (robots, newRobot, stockTypes) => {
  let newRobots = {}
  for (let stock of stockTypes) {   // robot tpre names are the same as the stock names they produce : ore robot produces ore
    newRobots[stock] = newRobot === stock ? 1 + robots[stock] : robots[stock]
  }
  return newRobots
}

const recurse = (blue, stock = {}, robots = {}, time = 0, timeLimit = 32, memo = new Map()) => { 

  // stop when time up
  if (time === timeLimit) { // time up after timelimt minutes
    return stock['geo']
  }

  // Memoisation for efficiency:  return previous result for these inputs, if found
  const key = JSON.stringify(time)+JSON.stringify(Object.values(stock))+JSON.stringify(Object.values(robots))
  if (memo.has(key)) {
    return memo.get(key)
  }
  if (memo.size > 10000000) {
    memo = new Map()  // empty the memo map if too big - it crashed out due to size in excess of memory available in this code unless reset
  }

  let bestGeodes = 0
  let theseGeodes = 0
/* Try all the build options.  
- Only stock available at the start of this minute can be used to build a robot 
- Robots built are not available until the next minute*/

const stockTypes = ['ore', 'cly', 'obn', 'geo']

// Limit the numbers of each type of robot that will be produced to reduce the execution time needed.  The maximum needed
// is 1 more than the number that can produce enough of their product to produce one of (each of) the higher order (closer to geode) robots in one minute.
// Since a robot takes a minute to make, and only one can be made in one minute, you don't need any more robots producing ingredients; it will be better to use the next minute
// building the higher order robot.  (If you already have 1 more than this, then you must have the required ingredients from production at the start of this minute.)

const maxRobots = {'ore': Math.max(blue['cly']['ore'], blue['obn']['ore'], +blue['geo']['ore']), 'cly' : +blue['obn']['cly'], 'obn' : +blue['geo']['obn']}

// Try to build each type of robot from available stock, or just produce stock from existing robotd
const saveStock = {...stock} // save a copy of the stock level
const saveTime = time // save the time at the outset
for (let robot of stockTypes) {
  // If you've already got enough robots of this type to produce another robot of a higher type skip to the next type.
  if (robots[robot] === maxRobots[robot]) {
    //console.log(key)
    continue
  }
  // while you havent got the stock to build it, take time to build stock.. 
  
  while (!haveStock(blue[robot], stock) && time < timeLimit) {
    stock = buildStock(robots, stock)
    time = time + 1
  }
  if (haveStock(blue[robot], stock) && time < timeLimit) {  
    
    theseGeodes = recurse(blue, newStk(blue[robot], robots, stock), newRbts(robots, robot, stockTypes), time+1, timeLimit, memo)   
    if (theseGeodes > bestGeodes) bestGeodes = theseGeodes
  } 
  stock = {...saveStock}
  time = saveTime
}
    memo.set(key, bestGeodes) // passed by reference so will be used

  return bestGeodes
  
}

const solveIt  = async() => {
  const input = await readlines()
  //const input = testInput2
  let n
  let bluePrints = []
  let geodes = 0
  let quality = 0
  let stock
  let robots
  let start
  let end

  for (let line of input) {
    n = line.match(numberRegex)
    bluePrints.push({blueNum: n[0], ore: {ore : n[1]}, cly: {ore: n[2]}, obn : {ore: n[3], cly: n[4]}, geo: {ore: n[5], obn: n[6]}})
  }
  
  // loop over all bluePrints
  for (let blue of bluePrints) {  
    // start with no stock, 1 ore robot
    start = performance.now()
    geodes = recurse(blue, stock = {ore: 0, cly: 0, obn: 0, geo: 0}, robots = {ore: 1, cly: 0, obn: 0, geo: 0}, 0, 24)  // 32 minute time limit in part 2
    
    end = performance.now(); 
    console.log('bluePrint No. ', blue.blueNum, 'Maximum geodes', geodes, `Execution time: ${end - start} ms`)
    quality = quality + geodes * blue.blueNum
  }
  return 'Part 1 ' + quality 
}

solveIt().then(console.log)
// 1150

const solveItPart2  = async() => {
  const input = await readlines()
  //const input = testInput2
  let n
  let bluePrints = []
  let geodes = 0
  let stock
  let robots
  let product = 1
  let start
  let end

  for (let line of input) {
    n = line.match(numberRegex)
    bluePrints.push({blueNum: n[0], ore: {ore : n[1]}, cly: {ore: n[2]}, obn : {ore: n[3], cly: n[4]}, geo: {ore: n[5], obn: n[6]}})
  }
  
  // loop over all bluePrints
  for (let blue of bluePrints.slice(0,3)) {  //Only the first 3 blueprints used in  part 2
    // start with no stock, 1 ore robot
    start = performance.now()

    geodes = recurse(blue, stock = {ore: 0, cly: 0, obn: 0, geo: 0}, robots = {ore: 1, cly: 0, obn: 0, geo: 0}, 0, 32)  // 32 minute time limit in part 2
    
    end = performance.now(); 
    console.log('bluePrint No. ', blue.blueNum, 'Maximum geodes', geodes, `Execution time: ${end - start} ms`)
    product = product * geodes
  }
  return 'Part 2 ' + product  
}

solveItPart2().then(console.log)
//37367

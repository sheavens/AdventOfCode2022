// Move numbers in the order given in the input list, within
// an output list, when the movement of the number is forawrd by its
// value, or backward if negative.  The output list will wrap if move is over the end.
// read an input file with promises
const fs = require("fs").promises;
const assert = require('assert');
const { map } = require("lodash");

const readlines = async() => {
    const data = await fs.readFile('day20_input.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    //const blankLine = /\r\n\r\n|\r\r|\n\n/
    //return data.split(blankLine).map(e => e.split(newLine)) 
    return data.split(newLine).map(e => Number(e))
};


const testInput = [
1,
2,
-3,
3,
-2,
0,
4,
]

const withSlice = (input) => {

let output = [...input]

let index
let newIndex
for (let m of input) {
    index = output.findIndex(e => e===m)
    if (m > 0) {
        newIndex = (index+m) % input.length 
        output = [...output.slice(index+1,newIndex+1), m, ...output.slice(newIndex+1)]
    } else {
        //output.reverse()
        newIndex = (index-m) % input.length 
        output = [...output.slice(index+1,newIndex+1), m, ...output.slice(newIndex+1)]
        //output.reverse()
    }
}
}
//withSlice(testInput)



//** Avoid expensive slice */
// insert a value in the sequenece stored in the map.

// convert map to array to search for a value in the array
//Array.from(seqMap.keys)
// load a matrix giving how many places a number is from any other number to the


class Node {
    constructor(value) {
        this.value = value
        this.next = null
        this.prev = null
    }
}

class TwoWayLinkedListCirc {
    constructor(length) {
        this.head = new Node(null)
        this.length = length
    }
    append(node) {
        if (this.head.value === null) {
            this.head = node
            node.next = node  
            node.prev = node   // links back to self
        } else {
            let prev = this.head.prev
            prev.next = node  // insert new node before the head - 4 new links
            node.prev = prev
            node.next = this.head
            this.head.prev = node
        }
        return this
    }
    get(nodeValue, nodesAway) {
        // returns the nore value a number 'nodesAway' from the node with value 'nodeValue'
        nodesAway = nodesAway % (this.length)  
        if (nodesAway === 0) return nodeValue // nodesAway 0 will be ignored - no move is made
        let node = this.head
        let val = node.value
        while (val !== nodeValue) {
            node = node.next //!! assumed nodeValue is in there!
            val = node.value
        }
        // find new location
        let nodeCount = 0
        let curr = node
        while (nodeCount < nodesAway) {
            curr = curr.next
            nodeCount +=1
        }
        return curr.value        
    }
    move(nodeValue, nodesAway) {
        nodesAway = nodesAway % (this.length-1)  // reduce moves to within size of circular list of moves
        if (nodesAway === 0) return this // nodesAway 0 will be ignored - no move is made
        let prev, next
        let node = this.head
        let val = node.value
        while (val !== nodeValue) {
            node = node.next //!! assumed nodeValue is in there!
            val = node.value
        }
        // link the previos and next nodes
        next = node.next
        prev = node.prev
        prev.next = node.next
        next.prev = node.prev
        // find new location
        let nodeCount = 0
        let saved
        let curr = node
        if (nodesAway > 0) {
            while (nodeCount < nodesAway) {
                curr = curr.next
                nodeCount +=1
            }
        } else {
            if (nodesAway < 0) {  
                while (nodeCount < -1*nodesAway + 1) { // moves on one further
                    curr = curr.prev
                    nodeCount +=1
                }  
            }
        }
        // link node in new location
        saved = curr.next
        curr.next = node
        node.prev = curr
        node.next = saved 
        saved.prev = node 
        //this.print()
        return this        
    }
    print() {
        let curr = this.head
        let str =  curr.value + '->'
        curr = curr.next
        while (curr !== this.head) {
            str = str +  curr.value + '->'
            curr = curr.next
        }
        console.log(str)
        return
    }
}


const solveIt  = async() => {
    const input = await readlines()
    //const input = testInput

    let labelled = input.map((e,i) =>  i + '_' + e )
    let linked = new TwoWayLinkedListCirc(labelled.length)
    for (let l = 0; l < labelled.length; l++) {
        linked = linked.append(new Node(labelled[l]))
    }
    //linked.print()

    // make a move
    for (let i = 0; i < input.length; i++) {
        linked = linked.move(labelled[i], input[i], linked)
    }

    // find the label of 0 value in labelled array
    const zeroAt = input.indexOf(0)
    const zeroLabelled = labelled[zeroAt]

    const first = Number(linked.get(zeroLabelled,1000).split('_')[1])
    const second = Number(linked.get(zeroLabelled,2000).split('_')[1])
    const third = Number(linked.get(zeroLabelled,3000).split('_')[1])
    const result = first + second + third

    return 'Part 1 ' +  result
}

solveIt().then(console.log)

const solveItPart2  = async() => {
    const input = await readlines()
    //const input = testInput

    const key = 811589153
    const scaledMoves = input.map(e => e * key)  // this has could be applied to just the moves and result (not the labels)

    let labelled = scaledMoves.map((e,i) =>  i + '_' + e )
    let linked = new TwoWayLinkedListCirc(labelled.length)
    for (let l = 0; l < labelled.length; l++) {
        linked = linked.append(new Node(labelled[l]))
    }
    //linked.print()


    // mix 10 times with moves scaled up
    for (let i = 0; i < 10; i++) {
        for (let i = 0; i < input.length; i++) {
            linked = linked.move(labelled[i], scaledMoves[i], linked)
        }
        //linked.print()
    }

    // find the label of 0 value in labelled array
    const zeroAt = input.indexOf(0)
    const zeroLabelled = labelled[zeroAt]


    const first = Number(linked.get(zeroLabelled,1000).split('_')[1])
    const second = Number(linked.get(zeroLabelled,2000).split('_')[1])
    const third = Number(linked.get(zeroLabelled,3000).split('_')[1])
    const result = (first + second + third) //* key // numbers are also scaled up

    return 'Part 2 ' +  result
}
solveItPart2().then(console.log)
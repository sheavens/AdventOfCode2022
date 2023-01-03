/* play rock paper scissors Paert 1: with given input moves get score of sum of rounds.
Score for each round is 6 for a win plus a score for the option you choose,
rock: 2, paper 1, scissors 3. */

// read an input file with promises
const fs = require("fs").promises;

const readlines = async() => {
    const data = await fs.readFile('day2_input.txt', {encoding: 'utf-8'});
    const newLine = /\r\n|\r|\n/
    //const blankLine = /\r\n\r\n|\r\r|\n\n/
    return data.split(newLine).map(e => e.split(' ')) 
};

testInput = [['A', 'Y'],
['B', 'X'],
['C', 'Z']]

const player1 = (play = ['R','P']) => {
    const beats = ['P','R','S','P']
    const playScore = [2,1,3]
    const optScore = playScore[beats.indexOf(play[0])]
    if (beats[beats.indexOf(play[0])+1] === play[1]) { // player1 win
        return 6 + optScore
    } else if (beats[beats.indexOf(play[0])] === play[1]) { // draw
        return 3 + optScore
    }
    return 0 + optScore //loss
}
//console.log(player1())
const player2 = (play = [ 'R', 'P']) => player1([play[1], play[0]])
//console.log(player2())

const translate = (inputPlay = ['C','Z']) => {
    const [play1, play2] = inputPlay
    const play1Options = ['A','B','C']
    const play2Options = ['X','Y','Z']
    const translated = ['R','P','S'] 
    return [translated[play1Options.indexOf(play1)], translated[play2Options.indexOf(play2)]]
}
//console.log(translate())
const translatePart2 = (inputPlay = ['C','Z']) => {
    // translate rules now X lose, Y draw, Z win
    const [play1, play2] = inputPlay
    const play1Options = ['A','B','C']
    const translated = ['R','P','S'] 
    
    const play2Options = ['X','Y','Z']
    const play2Outcomes =['L','D','W']
    const beats = ['P','R','S','P']
    const loses = ['P','S','R','P']
    
    const rps = translated[play1Options.indexOf(play1)]
    const wld =  play2Outcomes[play2Options.indexOf(play2)]
    switch (wld) {
        case 'W': // return player 2 choice for a player1 loss
            return [rps, loses[loses.indexOf(rps)+1]]
            break;
        case 'D': // return player 2 choice for a draw
            return [rps, rps]
            break;   
        default: // return player 2 choice for a player 1 win
            return [rps, beats[beats.indexOf(rps)+1]]
            break;
    }
}
//console.log(translatePart2(testInput[0]))
//console.log(translatePart2(testInput[1]))
//console.log(translatePart2(testInput[2]))

const sumIt = (arr) => arr.reduce((a,b) => a + b, 0)
//console.log(sumIt([1,4,7]))

const solveIt  = async() => {
    const input = await readlines()
    //const input = testInput
    let scores = {}
    scores.player2 = sumIt(input.map(e => player2(translate(e))))
    return 'Part 1, my score ' + scores.player2
}

solveIt().then(console.log)

const solveItPart2  = async() => {
    const input = await readlines()
    //const input = testInput
    let scores = {}
    scores.player2 = sumIt(input.map(e => player2(translatePart2(e))))
    return 'Part 2, my score ' + scores.player2
}

solveItPart2().then(console.log)
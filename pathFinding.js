
// uses flatgrid and priority queue (see sets_queues_grids.js)
const shortestPath = (start, end, grid, print=false) => {       
    const cost = 1  // In this version cost of each move is 1.. could be generalised to use cost array

    let q = new PriorityQueue()
    let visited = new Set()
    // Initialise all priorites to infinity
    let priority = new Array(grid.width * grid.height).fill(Infinity)
    // reset start cell to priority 0 and enqueue it
    priority[start] = 0
    q.enqueue(start, 0, grid)

    // ** Cycle of path search
    let next
    while (!q.isEmpty()) {
        // Dequeue next priority element and add it to visited set
        next = q.dequeue()
        if (!visited.has(next.element)) { // * a visited cell in the queue will already have been treated
            visited.add(next.element)
            // update cost of unvisited neighbours and add them to the Priority Queue to visit
            for (let n of next.neighbours) { 
                if (visited.has(n)) continue
                // priority reset as lowest cost to get there discovered so far
                // cells numbers same as array indices in cost array, so use indices to find them
                // cumulative ?? input cell cost + (for A*) heuristic gives priority for the queue (A*)
                if (priority[n] > next.priority + cost)  // will always be lower than initial Infinity
                    priority[n] = next.priority + cost
                // priority will always be higher if changed here.
                // * don't need to change the priority of this neighbour in the queue, just enqueue it again
                // at higher priority; it will not be used if in visited set when dequeued
                q.enqueue(n, priority[n], grid) // the cumulative cost is the priority
            }
            if (next.element === end) break  // target node reached 
        }
    }
    if (print) printFlatGrid(flatGridLiteral(grid.width, grid.height, priority))
    return priority[end]
}

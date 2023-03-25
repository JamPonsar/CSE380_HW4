import Stack from "../../Wolfie2D/DataTypes/Collections/Stack";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import NavPathStrat from "../../Wolfie2D/Pathfinding/Strategies/NavigationStrategy";

// TODO Construct a NavigationPath object using A*

/**
 * The AstarStrategy class is an extension of the abstract NavPathStrategy class. For our navigation system, you can
 * now specify and define your own pathfinding strategy. Originally, the two options were to use Djikstras or a
 * direct (point A -> point B) strategy. The only way to change how the pathfinding was done was by hard-coding things
 * into the classes associated with the navigation system. 
 * 
 * - Peter
 */
interface Node{
    index: number,
    a: number,
    b: number,
    c: number,
    parent: number
};

export default class AstarStrategy extends NavPathStrat {

    /**
     * @see NavPathStrat.buildPath()
     */

    public findLowestFNode(open: Node[]) {
        let min = open[0].c;
        let index = 0
        for(let i = 1; i < open.length; i++) {
            if (open[i].c < min) {
                min = open[i].c;
                index = i
            }
        }
        return index;
    }

    public getNeighbors(current: Node) {
        let edges = this.mesh.graph.getEdges(current.index);
        let neighbors = [];
        while(edges != null) {
            neighbors.push(edges.y);
            edges = edges.next;
        }
        return neighbors;
    }

    public checkNeighborInList (neighbor: number, list: Node[]) {
        let i = 0
        for(let val of list) {
            if(val.index === neighbor) {
                return i;
            }
            ++i;
        }
        return -1;
    }

    public getDistance(neighbor: number, source: number): number {
        let neighborVec2: Vec2 = this.mesh.graph.positions[neighbor];
        let sourceVec2: Vec2 = this.mesh.graph.positions[source];
        return Math.abs(neighborVec2.x - sourceVec2.x) + Math.abs(neighborVec2.y - sourceVec2.y);
    }

    public buildPath(to: Vec2, from: Vec2): NavigationPath {
        let start = this.mesh.graph.snap(from);
		let end = this.mesh.graph.snap(to);
        let startNode: Node = {
            index: start,
            a: 0,
            b: -1,
            c: -1,
            parent: -1,
        }
        let open: Node[] = [startNode];
        let closed: Node[] = [];
        let current: Node;

        while(open.length != 0) {
            let lowestFNode = this.findLowestFNode(open);
            current = open[lowestFNode];
            open.splice(lowestFNode, 1);
            closed.push(current);
            if(current.index === end) {
                console.log("Reached the end.");
                break;
            }
            let neighbors = this.getNeighbors(current)
            console.log(neighbors);
            for(let neighbor of neighbors) {
                if(this.checkNeighborInList(neighbor, closed) > -1) {
                    continue;
                }
                let neighborNode: Node = {
                    index: neighbor,
                    a: this.getDistance(neighbor, start),
                    b: this.getDistance(neighbor, end),
                    c: this.getDistance(neighbor, start) + this.getDistance(neighbor, end),
                    parent: current.index,
                };
                let index = this.checkNeighborInList(neighbor, open)
                if(index != -1) {
                    let openF = open[index].a + open[index].b;
                    if (neighborNode.c < openF){
                        open[index].a = neighborNode.a;
                        open[index].parent = current.index;
                    }
                }
                else {
                    open.push(neighborNode);
                }
            }
        }
        let stack = new Stack<Vec2>(this.mesh.graph.numVertices);
        while(current.parent != -1) {
            let vec2 = this.mesh.graph.positions[current.index];
            stack.push(vec2);
            for(let node of closed) {
                if(current.parent === node.index) {
                    current = node;
                }
            }
        }
        return new NavigationPath(stack);
    }
    
}
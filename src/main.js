import paper from "paper";
import Util from "./Utils/Utilities"
import GABuilder from "./ga/GABuilder"
import {Point} from "./geometry/Point"

var environment = new paper.Point(32, 30)
var step = 20;

let size_list = [   new Point(12,8), 
    new Point(12,4), 
    new Point(8,4),
    new Point(4,4),
    new Point(12,6),
    new Point(1,1),
    new Point(6,6),
    new Point(6,12),
    new Point(2,8),
    new Point(2,4)]


size_list = [   new Point(12,8), 
new Point(12,4), 
new Point(12,4), 
new Point(8,8),
new Point(8,4),
new Point(8,4),
new Point(8,12),
new Point(6,12),
new Point(4,8),
new Point(4,8)]

size_list = [   new Point(12,8), 
new Point(12,8), 
new Point(12,8), 
new Point(8,8),
new Point(8,4),
new Point(4,4),
new Point(4,4),
new Point(8,12),
new Point(8,12),
new Point(6,12)]

const initialize = function(){

    var poolSize = 10;
    var length = 10;
    Util.drawCoordinateSystem(environment.x, environment.y, step);

    var t0 = performance.now();
    
    GABuilder.initializeGA(poolSize, length, size_list);
    
    var t1 = performance.now()
    console.log("initialization took " + (t1 - t0).toFixed(3) + " milliseconds.")
    
    GABuilder.genePool[0].draw(true);
}

const evaluate = function(){

}

const mutation = function(){

}

export {initialize};
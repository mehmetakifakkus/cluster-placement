import paper from "paper";
import Util from "./Utils/Utilities"
import GABuilder from "./ga/GABuilder"
import {File} from './File'
import {Point} from './geometry/Point'
import {StringCluster} from './Utils/StringCluster'

var environment = new paper.Point(32, 30)
var step = 20;

let file_list = [ 
    new File('design1.ai', 1200, 1600), 
    new File('design2.ai', 2400, 1600), 
    new File('design3.ai', 120,80), 
    new File('renderdesign1.png', 800,800),
    new File('renderdesign2.png', 400,400),
    new File('renderdesign3.png', 1000,1000),
    new File('sketch1.jpeg', 800,400),
    new File('sketch2.jpeg', 240,120),
    new File('sketch3.jpeg', 360,180)
]

const initialize = function(){

    var poolSize = 10;
    var length = file_list.length;
    Util.drawCoordinateSystem(environment.x, environment.y, step);

    var t0 = performance.now();
    
    let ga = GABuilder.initializeGA(poolSize, length, File.getSizeList(file_list));
    
    var t1 = performance.now()
    console.log("initialization took " + (t1 - t0).toFixed(3) + " milliseconds.")
    
    ga.best().translate(new Point(0, 0));

    ga = ga.evolve();
    ga.draw(true);

    let clusters = new StringCluster(File.getNameList(file_list));
    console.log(clusters.arranged)

    // !TODO: sonrasinda paneller ile dosyalar var, once panelleri koy cluster icinde


}

export {initialize};
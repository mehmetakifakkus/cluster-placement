import paper from "paper";
import Util from "./Utils/Utilities"
import {GABuilder} from "./ga/GABuilder"
import {File} from './File'
import {Point} from './geometry/Point'
import Chromosome from "./ga/Chromosome";

var environment = new paper.Point(16, 15)
var step = 40;

let file_list = [ 
    new File('design1.ai', 1200, 1600), 
    new File('design2.ai', 2400, 1600), 
    new File('design3.ai', 80,120), 
    new File('design3.ai', 80,120), 
    new File('design3.ai', 80,120), 
    new File('renderdesign1.png', 800,800),
    new File('renderdesign2.png', 400,400),
    new File('renderdesign3.png', 1000,1000),
    new File('renderdesign4.png', 1200,1200),
    // new File('renderdesign5.png', 800,800),
    // new File('renderdesign6.png', 400,400),
    // new File('renderdesign7.png', 1000,1000),
    // new File('renderdesign8.png', 1200,1200),
    // new File('renderdesign9.png', 800,800),
   
    new File('sketchv1.jpeg', 800,400),
    new File('sketchv2.jpeg', 240,120),
    new File('sketchv3.jpeg', 360,180),
    // new File('sketchoutput1.jpeg', 800,400),
    // new File('sketchoutput2.jpeg', 240,120),
    // new File('sketchoutput3.jpeg', 360,180)
]

let ga = null;
let clusters = null;

const initialize = function(file_text_list){

    var poolSize = 16;
    
    paper.project.activeLayer.removeChildren();
    Util.drawCoordinateSystem(environment.x, environment.y, step);

    var t0 = performance.now();

    let gas = []
    for(let i=0; i<10; i++)
    {
        let tempGa = new GABuilder(poolSize, File.getSizeList(file_list));    
    
        for (let step = 0; step < 5; step++) {
            tempGa.evolve();
        }
        gas.push(tempGa);
    }

    gas.sort((a,b) => {return b.best().fitnessValue - a.best().fitnessValue});

    ga = gas[0]
    console.log(gas)   
    
    var t1 = performance.now()
    console.log("initialization took " + (t1 - t0).toFixed(3) + " milliseconds.")
}

// get file list from the textBox 
// and create the File object
function generateFileList(file_text_list){
    return file_text_list.map((it) => {
        let splitted = it.split(',');
        if(splitted.length === 3)
            return new File(splitted[0], splitted[1], splitted[2]);
        else    
            return new File(splitted[0], 1, 1);
            
    })
}

function fileGA(map, title){

    let item_list = [];
    for (let [key, value] of map) {
        
        if(value instanceof Map)
        {
            item_list.push(fileGA(value, key))
            // console.log(key);
        }
        else
        {
            // burada biriktir ve harf sirasina koy, sonrasinda GA tarafina yolla
            item_list.push(value);
        }
    }

    // en basta harf sirasina koymak sorunu büyük oranda çözebilir
    //items.sort( function(a, b){return a.localeCompare(b)});

    if(item_list.length > 1)
    {
        let ga = new GABuilder(10, item_list);
        ga.title = title;
        return ga;
    }
    else 
        return item_list[0];
    

}

function printMap(map){

    for (let [key, value] of map) {
        
        if(value instanceof Map)
        {
            printMap(value)
            console.log(key);
        }
        else
            console.log(key, value);
            // burada biriktir ve harf sirasina koy
            // sonrasinda GA tarafina yolla
    }

    if(map.size > 1)
        console.log('biriken kisimlar GA ya gonderildi')
}

function getGA(){
    return ga;
}


export {initialize, getGA};
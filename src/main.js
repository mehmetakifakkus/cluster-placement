import paper from "paper";
import Util from "./Utils/Utilities"
import {GABuilder} from "./ga/GABuilder"
import {File} from './File'
import {Point} from './geometry/Point'
import {StringCluster} from './Utils/StringCluster'
import {FileCluster} from './Utils/FileCluster'
import {parseFileList} from './Utils/parseFileList'
import Chromosome from "./ga/Chromosome";

var environment = new paper.Point(32, 30)
var step = 20;

let file_list = [ 
    new File('design1.ai', 1200, 1600), 
    new File('design2.ai', 2400, 1600), 
    new File('design3.ai', 120,80), 
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

    var poolSize = 10;
    
    paper.project.activeLayer.removeChildren();

    Util.drawCoordinateSystem(environment.x, environment.y, step);

    
    // let ga = new GABuilder(poolSize, file_list);
    // var t1 = performance.now()
    // console.log("initialization took " + (t1 - t0).toFixed(3) + " milliseconds.")
    
    // ga.best().move(new Point(5, 5));
    
    // ga.evolve();
    // console.log(ga)
    // ga.best().draw(true);
    
    // let clusters = new StringCluster(File.getNameList(file_list));
    
    clusters = new FileCluster(parseFileList(file_text_list));
    console.log(clusters.arranged)
    printMap(clusters.arranged)
    
    // !TODO: sonrasinda paneller ile dosyalar var, once panelleri koy cluster icinde
    
    var t0 = performance.now();
    ga = fileGA(clusters.arranged, 'root')
    console.log(ga)

    for (let step = 0; step < 5; step++) {
        ga.evolve();
    }

    draw(ga, new Point(0,0));

    var t1 = performance.now()
    console.log("initialization took " + (t1 - t0).toFixed(3) + " milliseconds.")
}

function draw(ga, point =  new Point(0,0)){

    const isChildFile = (item) => {
        return item.chromosome[0].content instanceof File;
    }
    
    let layout = ga.best();
    // console.log(layout)
    
    if(layout instanceof Chromosome)
    {
        // console.log(layout, ga)
        if(isChildFile(layout))
        {
            layout.move(point)
            layout.draw(true);
        }
    }

    layout.chromosome.forEach((it)=>{
        
        if(it.content instanceof GABuilder)
        {
            // console.log(it.content, it.point)
            draw(it.content, point.add(it.point))
        }
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

function getClusters(){
    // return new Promise((resolve) => {
    //     if(clusters)
    //     {
    //         resolve();
    //         return clusters;
    //     }
    // })
    return clusters;
}

export {initialize, draw, getGA, getClusters};
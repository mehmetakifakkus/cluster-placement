import paper from "paper";
import Util from "./Utils/Utilities"
import {GABuilder} from "./ga/GABuilder"
import {File} from './File'
import {Point} from './geometry/Point'
import {Cluster, FileCluster} from './Utils/FileCluster'
import { SimpleLayout } from "./Utils/SimpleLayout";
import Chromosome from "./ga/Chromosome";
import { Panel } from "./Panel";

var environment = new paper.Point(32, 30)
var step = 30;

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

    clusters = new FileCluster(generateFilePanelList(file_text_list));
    console.log(clusters.arranged)
    console.log(clusters.listed)
    // printMap(clusters.arranged)
    
    // !TODO: sonrasinda paneller ile dosyalar var, once panelleri koy cluster icinde

    var t0 = performance.now();
    // ga = fileGA(clusters.arranged, 'root')
    ga = fileGAList(clusters.listed);
    console.log(ga)

    for (let step = 0; step < 100; step++) {
        ga.evolve();
    }

    // console.log(extract(ga, new Point(0,0)));
    draw(ga, new Point(0,0));
    console.log(ga)

    var t1 = performance.now()
    console.log("initialization took " + (t1 - t0).toFixed(3) + " milliseconds.")
}

// get files from the textBox 
// and create the File object list
function generateFilePanelList(file_text_list){
    return file_text_list.map((it) => {
        let splitted = it.split(',');
        if(splitted[0] == 'P')
        {
            return new Panel(splitted[1].trim(), 6, 3);
        }
        else if(splitted.length === 3)
            return new File(splitted[0], splitted[1], splitted[2]);
        else    
            return new File(splitted[0], 1, 1);
    })
}

function extract(layout, point){
    if(layout instanceof GABuilder)
    {
        return extractGA(layout, point);
    }
    else if(layout instanceof SimpleLayout)
    {
        return extractSimple(layout, point);
    }
}

function extractSimple(sl, point = new Point(0, 0)){ // sl = simpleLayout
    sl.move(point); // shift items
    return sl.item_list;
}

function extractGA(ga, point =  new Point(0,0)){

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
            // layout.draw(true);
        }
    }

    let list = []
    layout.chromosome.forEach((it) => {
        
        it.point = it.point.add(point);

        
        if(it.content instanceof File)
        {
            // it.draw(true);            
            list = list.concat(it.content);
            // list.push(it.content);
        }
        else
            list = list.concat(extract(it.content, it.point))
            // list.push(extract(it.content, it.point))
    })

    return list;
}


function draw(layout, point){
    if(layout instanceof GABuilder)
    {
        drawGA(layout, point);
    }
    else if(layout instanceof SimpleLayout)
    {
        drawSimple(layout, point);
    }
}

function drawSimple(sl, point = new Point(0, 0)){ // sl = simpleLayout

    sl.move(point); // shift items
    sl.draw_items();

}

function drawGA(ga, point =  new Point(0,0)){

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

    layout.chromosome.forEach((it) => {
        
        it.point = it.point.add(point);

        draw(it.content, it.point)

        if(it.content instanceof File || it.content instanceof Panel)
        {
            it.draw(true);
        }
    })
}

// run genetic algorithm on clusters
// give each cluster a title
function fileGAList(cluster){

    let item_list = [];

    cluster.children.map(item => {
        if(item instanceof Cluster)
            item_list.push(fileGAList(item)) // add a cluster
        else
            item_list.push(item) // add a file
    })
    
    let layout = {};
    if(SimpleLayout.isItIdentical(item_list))
    {
        layout = new SimpleLayout(item_list)
        // console.log(item_list)
    }
    else
        layout = new GABuilder(10, item_list);
    
    layout.title = cluster.name;
    // console.log(item_list, ' ---> ', ga)
    return layout;
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
    return clusters;
}

export {initialize, draw, getGA, getClusters};
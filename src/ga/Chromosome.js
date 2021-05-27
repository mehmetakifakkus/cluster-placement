import paper from "paper";
import Block from "./Block"
import Util from "../Utils/Utilities"
import {Point} from "../geometry/Point"


class Chromosome{

    constructor(length, flag){

        this.chromosome = [];
        this.length = length;
        this.totalArea = 0;
        this.fitnessValue = 0;
        
        if(flag)
            this.initialize();
    }
    
    setChromosome(ch, totalArea, totalInverseRatio){
        this.chromosome = ch;
        this.length = ch.length;
        this.totalArea = totalArea;
        this.totalInverseRatio = totalInverseRatio;
    }   
    
    initialize(size_list){
        
        // Create blocks

        console.log(size_list)
        // first place the first one to 0,0 location
        var b = new Block(this, size_list[0], new Point(0,0));
        b.placed = true;
        this.chromosome.push(b);
        
        for(var i=1; i < this.length; i++)
            this.chromosome.push(new Block(this, size_list[i])); // itself given as parent of the block

        this.calculateAreas();
        this.sortByArea();
    }
        
    getArea(){
        return this.totalArea;
    }

    calculateAreas(){
        let ch = this.chromosome;
        ch.forEach( it => {this.totalArea += it.getArea()});
    }

    sortByArea(type){
        var type_ = type || 0;
        if(type_)
            this.chromosome.sort(function(a, b) {return a.getArea() - b.getArea();});
        else
            this.chromosome.sort(function(a, b) {return b.getArea() - a.getArea();});
    }

    draw(beautify){
        this.chromosome.forEach(it => {it.draw(beautify)})
    }

    redraw(beautify){
        paper.project.activeLayer.removeChildren();
        // this.remove();

        this.chromosome.forEach(it => {it.draw(beautify)})

        this.fitnessValue = this.fitnessFunction();    
    }

    remove(){
        for(var i = 0; i < this.chromosome.length; i++)
            this.chromosome[i].remove();
    }

    setVisibility(visibility){
        this.chromosome.forEach((it) =>{it.drawing.visible = visibility});
    }

    // this.populate = populate1;
    populate(type_){
    
        Block.counter = 0;
        var type = type_ || 1;

        // clone the chromosome
        var copied = this.clone();

        copied.mutate(type);
        copied.fitnessValue = copied.fitnessFunction();

        // return newly mutated gene
        return copied;
    }
    
    mutate(type_){
        var type = type_ || 1;
        
        if(type == 4)
            this.mutate4();
        else if(type == 5)
            this.mutate5();
        else if(type == 6)
            this.mutate6(); // move the smallest 3
    }

    // change positions a bit according to topRight or bottomLeft
    mutate4(){

        // this.clearPositions();
        // this.clearPositionsHalved();
        // iterate over all genes and change their positions a bit
        for(var i = 1; i < this.chromosome.length; i++) // except the first one
        {
            this.chromosome[i].changePosAbit2();
        }
    }
    
    mutate5(){
        // this.clearPositions();
        this.clearPositionsHalved();
        // iterate over all genes and change their positions a bit
        for(var i = 1; i < this.chromosome.length; i++) // except the first one
        {
            this.chromosome[i].changePosAbit2();
        }
    }

    mutate6(ch){
        for(var i = this.chromosome.length-3; i < this.chromosome.length; i++) // except the first one
        {
            this.chromosome[i].changePosAbit2();
        }
    }


    // tbd
    noCollision(){

        // iterate over it and mutate certain gene a bit
        this.chromosome.forEach((it, i) => {
            if(i != 0)
                it.changePosAbitNoCollision();
        });
    }

    clone(){
        let ch = new Chromosome(10, false);
        let chromosome = this.chromosome.map((it)=>{
            let b = new Block(ch, it.size, it.point);
            b.inverseRatio = it.inverseRatio;
            return b;
        });
        
        ch.setChromosome(chromosome, this.totalArea, this.totalInverseRatio)
        return ch;
    }

    mutation(){
        for(var i=0; i < this.length; i++)
            this.chromosome[i].changePosAbit();
    }

    fitnessFunction(){
        let totalIndividialAreas = 0;

        // let gr = new paper.Group(); // create a paperjs group and get some statistics such as area of bounding box
        let r = this.chromosome[0].rectangle;
        // let aa = this.chromosome[0].drawing;


        this.chromosome.forEach(it => {
            totalIndividialAreas += it.getArea();
            // gr.children.push(it.drawing);
            r = r.unite(it.rectangle)
            // aa = aa.unite(it.drawing)
        });

        // let ratio = totalIndividialAreas / gr.bounds.area;
        let f1 = totalIndividialAreas / r.area;

        let ratio = r.width / r.height;
        let f2;
        
        if(ratio <= 2)
            f2 = 100 - (2 - ratio) * 50;
        else    
            f2 = 100 - (ratio - 2) * 10;

        return ((f1 + f2) / 2).toFixed(4);
    }

    clearPositions(){
        this.chromosome.forEach(it =>{
            it.placed = false;
        })
    }

    clearPositionsHalved(){
        var halfCh = this.chromosome.slice(this.chromosome.length/2, this.chromosome.length);

        halfCh.forEach(it =>{
            it.placed = false;
        })
    }

}


export default Chromosome;
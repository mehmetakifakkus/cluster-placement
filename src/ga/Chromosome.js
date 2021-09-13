import paper from "paper";
import Block from "./Block"
import Util, { PointSet } from "../Utils/Utilities"
import {Point} from "../geometry/Point"
import { Rectangle } from "paper/dist/paper-core";


class Chromosome{

    constructor(length, flag){

        this.chromosome = [];
        this.length = length;
        this.totalArea = 0;
        this.fitnessValue = 0;
        this.possiblePositions = new PointSet();
        
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

        // console.log(size_list)

        // first place the first one to 0,0 location
        var b = new Block(this, size_list[0], new Point(0,0));
        b.placed = true;
        
        this.chromosome.push(b);
        
        for(var i = 1; i < this.length; i++)
            this.chromosome.push(new Block(this, size_list[i])); // itself given as parent of the block

        this.calculateAreas();
        this.sortByArea();
    }

    initialize2(size_list){
        Block.counter = 0;
        this.possiblePositions = new PointSet();

        // Create blocks
        // first place the first one to 0,0 location
        var b = new Block(this, size_list[0], new Point(0,0));
        this.chromosome.push(b);
        this.possiblePositions.add(b.topRight)
        this.possiblePositions.add(b.bottomLeft)
        
        for(var i = 1; i < this.length; i++)
        {
            let b = new Block(this, size_list[i]);
            // let point = this.possiblePositions.getOne();
            let point = this.possiblePositions.getOne();
            // let point = Math.random() > 0.5? this.possiblePositions.getSmallestX(): this.possiblePositions.getSmallestY();
            
            b.setPoint(point);
            this.possiblePositions.add(b.topRight)
            this.possiblePositions.add(b.bottomLeft)
            
            this.possiblePositions.delete(point);

            // console.log(i, this.possiblePositions)
            this.chromosome.push(b); // itself given as parent of the block
        }

        this.calculateAreas();
        this.sortByArea();
        this.fitnessFunction();
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

    translate(vector){
        this.chromosome.forEach(it => {
            it.point = it.point.add(vector);
        })
    }

    remove(){
        for(var i = 0; i < this.chromosome.length; i++)
            this.chromosome[i].remove();
    }

    setVisibility(visibility){
        this.chromosome.forEach((it) =>{it.drawing.visible = visibility});
    }

    // this.populate = populate1;
    populate(type_, amount){
    
        Block.counter = 0;
        var type = type_ || 1;

        // clone the chromosome
        var copied = this.clone();

        copied.mutate(type, amount);
        copied.fitnessValue = copied.fitnessFunction();

        // return newly mutated gene
        return copied;
    }
    
    mutate(type_, amount){
        var type = type_ || 1;
        
        if(type == 4)
            this.mutate4(); // move all
        else if(type == 5)
            this.mutate5(); // move half of the block
        else if(type == 6)
            this.mutate6(); // move the smallest 3
        else if(type == 7)
            this.mutate7(amount); // move the smallest 5
    }

    // change positions a bit according to topRight or bottomLeft
    mutate4(){

        // this.clearPositions();
        // this.clearPositionsHalved();
        // iterate over all genes and change their positions a bit
        for(var i = 1; i < this.chromosome.length; i++) // except the first one
        {
            this.chromosome[i].changePosAbit2();
            // this.chromosome[i].changePosAbit3();
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
            // this.chromosome[i].changePosAbit2();
            this.chromosome[i].changePosAbit3();
        }
    }

    mutate7(amount){
        for(var i = this.chromosome.length - amount; i < this.chromosome.length; i++) // except the first one
        {
            // this.chromosome[i].changePosAbit2();
            this.chromosome[i].changePosAbit3();
        }
        this.fitnessFunction();
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

    localSearch(){
        let ch = this.chromosome;
        
        for(let id = ch.length/10; id < ch.length; id++) // except the first one
        {
            ch[id].localSearch();
        }

    }

    fitnessFunction(){
        let totalIndividialAreas = 0;

        // let gr = new paper.Group(); // create a paperjs group and get some statistics such as area of bounding box
        let bbox = this.chromosome[0].rectangle;
        // let aa = this.chromosome[0].drawing;


        this.chromosome.forEach(it => {
            totalIndividialAreas += it.getArea();
            // gr.children.push(it.drawing);
            bbox = bbox.unite(it.rectangle)
            // aa = aa.unite(it.drawing)
        });

        // let contour = new paper.Path.Rectangle({
        //     point: this.chromosome[0].rectangle.point,
        //     size: this.chromosome[0].rectangle.size,
        //     visible: false
        // });

        // this.chromosome.forEach(it => {
        //     let path = new paper.Path.Rectangle({
        //         point: it.rectangle.point,
        //         size: it.rectangle.size,
        //         visible: false
        //     });
        //     contour = contour.unite(path)
        // });


        // console.log('segments', contour.segments?.length)

        this.bbox = bbox;

        // let ratio = totalIndividialAreas / gr.bounds.area;
        let f1 = 100 * this.getArea() / bbox.area;

        let ratio = bbox.width / bbox.height;
        let f2;
        
        if(ratio <= 2)
            f2 = 100 - (2 - ratio) * 50;
        else    
            f2 = 100 - (ratio - 2) * 10;

        // return f1;
        this.fitnessValue = (0.6 * f1 +  0.4 * f2).toFixed(4);
        // this.fitnessValue = (0.6 * f1 +  0.4 * f2).toFixed(4) - contour.segments?.length * 3;

        // if(isNaN(this.fitnessValue))
        //     this.fitnessValue = 10;

        return this.fitnessValue;
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
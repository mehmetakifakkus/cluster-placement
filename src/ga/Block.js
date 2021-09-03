
import paper from "paper";
import Util from "../Utils/Utilities";
import {Point} from "../geometry/Point";
import {Rectangle} from "../geometry/Rectangle";
import { File } from "../File";
import { Panel } from "../Panel";

const step = 30;
const environment = new Point(32, 30)


class Block extends Rectangle{

    constructor(parent, item, point_){
        
        if(typeof Block.counter == 'undefined')
            Block.counter = 0;
        
        let point = point_ || (Util.getRandomPos());

        const getAppropriateSize = (item) =>{
            // if(item instanceof File || item instanceof Panel)
                // return item.getSize();
            // else // GABuilder
                return item.getSize();
        }
        let size = getAppropriateSize(item);  // || (Util.getRandomSize());
        
        super(point, size);

        this.id = Block.counter++; //  newly created block will have different id
        
        this.content = item;

        this.parent = parent;
        this.inverseRatio = 0;
        this.placed = false;

        this.bottomLeftChild = null;
        this.topRightChild = null;

        this.drawing = null;

        
    }

    getArea(){
        if(this.rectangle)
            return this.rectangle.area;
        else{
            return this.size.x * this.size.y;
        }    
    }

    getProbability(){
        return this.inverseRatio / this.parent.totalInverseRatio;
    }

    // ratio of totalBlockArea / blockArea
    getInverseRatio(){
        return this.inverseRatio;
    }

    intersects(item){

        if(typeof item == 'undefined'){
            let chromosome = this.parent.chromosome;

            for(let i=0; i<chromosome.length; i++){
                if(chromosome[i] !== this && chromosome[i].placed)
                if(chromosome[i].rectangle.intersects(this.rectangle))
                    return {result: true, item: chromosome[i]}
            }
        }
        else if(Array.isArray(item)){    // item represents all blocks (chromosome), this represents one specific block (gene)qh
            let chromosome = item;

            for(let i=0; i<chromosome.length; i++){
                if(chromosome[i] !== this)
                if (chromosome[i].rectangle.intersects(this.rectangle))
                    return {result: true, item: chromosome[i]}
            }
            
        }
        else if(item instanceof Block)
            if(item !== this)
                return {result: true, item: item}    

        return {result: false, item: item};
    }

    putInside(position){
        // if any dimension of the point below zero, make it zero
        let limitedByZero = Point.max(position, new Point(0,0)); 
        // if any dimension of the point exceeds the sides, limit it to width and height
        let limitedBySides = Point.min(limitedByZero, environment.subtract(this.size));

        return limitedBySides;
    }

    changePosAbit(amount){
        let amo = Math.round(amount) || 10;

        let delta = new Point(Util.getRandomInt(-amo, amo + 0.5), Util.getRandomInt(-amo, amo + 0.5));

        let revised = this.putInside(this.point.add(delta));
        this.setPoint(revised);   
    }

    /*
    * Find block an available place by looking already placed blocks
    */
    changePosAbit2(){
        let ch = this.parent.chromosome;
        let possiblePositions = []
        
        // look already placed ones
        for(let i=0; i < this.id; i++){
            possiblePositions.push(ch[i].topRight)
            possiblePositions.push(ch[i].bottomLeft)
        }

        var oldPosition = new Point(this.point.x, this.point.y);
        
        let revised = this.putInside(possiblePositions.one());
        this.setPoint(revised);
        
        for(let i=0; i < 1000  && this.intersects().result; i++)
        {
            // console.log(this.id + ', count:', i);
            let revised = this.putInside(possiblePositions.one());
            this.setPoint(revised); 
        } 

        if(this.intersects().result)
            this.setPoint(oldPosition);
        
        this.placed = true;
    }


    draw(beautify = false, color = "#650023"){

        var block, textCenter, textId;
        if(beautify)
        {
            block = new paper.Path.Rectangle({point: this.point.multiply(step), size: this.size.multiply(step), strokeWidth: 2, strokeColor: 'black', fillColor: color})
    
            var fontSize = Math.min(this.size.x, this.size.y) * step * 0.75;
            var textCenter = new paper.PointText({fontSize: fontSize/2 + 'px', fillColor: '#dddddd', content: this.size.x + 'x' + this.size.y, opacity: 1});  
            textCenter.style = {strokeColor: 'black', strokeWidth: .5};
            textCenter.position = block.position;
            
            var textId = new paper.PointText({fontSize: '20px', fillColor: '#ffffff', content: this.id+ ''});  
            textId.position = block.bounds.topLeft.add([14,18]);

            this.drawing = new paper.Group(block, textId, textCenter);
        }
        else
        {
            this.drawing = new paper.Path.Rectangle({point: this.point.multiply(step), size: this.size.multiply(step), strokeWidth: 2, strokeColor: 'black'}) //, fillColor: colors[this.id % colors.length]})
        }

        this.drawing.onMouseDown = (event) => {
            console.log(this.id, this.placed)
        }

        this.drawing.onClick = (event) => {
            console.log(this.id, this.content)
            alert(this.id+' '+ JSON.stringify(this.content))
        }

        this.drawing.onDoubleClick = (event) => {
            console.log(this.id, this.content)
        }

        // this.drawing.onMouseDrag = (event) =>{
        //     console.log(event.point)
        //     this.setPoint(event.point.x / environment.step, event.point.y / environment.step)
        //     this.drawing
        // }
    }

    remove(){
        if(this.drawing)
            this.drawing.remove();

        this.drawing = null;
    }

}

export default Block;
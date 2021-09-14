
import paper from "paper";
import Util, { PointSet } from "../Utils/Utilities";
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
                // if(chromosome[i] !== this && chromosome[i].placed)
                if(chromosome[i] !== this)
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
        else if(item instanceof Rectangle){
            var chromosome = this.parent.chromosome;

            for(var i=0; i < chromosome.length; i++){
                if(chromosome[i] != this)
                if(chromosome[i].rectangle.intersects(item.rectangle))
                    return {result: true, item: chromosome[i]}
            }
        }
        else if(item instanceof Block)
            if(item !== this)
                return {result: true, item: item}    

        return {result: false, item: item};
    }

    pointIntersects(point){
        let chromosome = this.parent.chromosome;

        for(let i=0; i < chromosome.length; i++){
            let rect = chromosome[i].rectangle;
            if(rect.contains(new paper.Point(point.x, point.y)))
                return {result: true, item: chromosome[i]}
        }
        return {result: false}
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
        
        // let revised = this.putInside(possiblePositions.one());
        let revised = possiblePositions.one();
        this.setPoint(revised);
        
        for(let i=0; i < 100  && this.intersects().result; i++)
        {
            // console.log(this.id + ', count:', i);
            // let revised = this.putInside(possiblePositions.one());
            let revised = possiblePositions.one();
            this.setPoint(revised); 
        } 

        if(this.intersects().result)
            this.setPoint(oldPosition);
        
        this.placed = true;
    }

    changePosAbit3(){
        let ch = this.parent.chromosome;
        let possiblePositions = new PointSet();
        
        let bbox = ch[0].rectangle;

        for(let i=1; i < this.id; i++)
            bbox = bbox.unite(ch[i].rectangle)

        // create possible positions item can be located
        for(let i=0; i < this.id; i++){ //! burada refactoring yapilabilir
            if(ch[i].topRight.x < bbox.width){
                // possiblePositions.add(JSON.stringify({x: ch[i].topRight.x, y:ch[i].topRight.y}))
                // if(!this.pointIntersects(ch[i].topRight).result)
                {
                    possiblePositions.add(ch[i].topRight)
                }
                // else
                {
                    // console.log(ch[i], 'topRight intersects', this.pointIntersects(ch[i].topRight))
                    
                }
            }
            if(ch[i].bottomLeft.y < bbox.height){
                // possiblePositions.add(JSON.stringify({x: ch[i].bottomLeft.x, y: ch[i].bottomLeft.y}))
                // if(!this.pointIntersects(ch[i].bottomLeft).result)
                    possiblePositions.add(ch[i].bottomLeft)
                // else
                    // console.log(ch[i], 'bottomLeft intersects', this.pointIntersects(ch[i].bottomLeft))

            }
            
            possiblePositions.delete(ch[i]);

        }
        
        let point = possiblePositions.getOne();
        if(!point)  return;

        let dd = this.intersects(new Rectangle(point, this.size));
        if(!dd.result)
            this.setPoint(point); 
    }

    localSearch(){
        let ch = this.parent.chromosome;
        let possiblePositions = new PointSet();
        
        let bbox = ch[0].rectangle;

        for(let i=1; i < this.id; i++)
            bbox = bbox.unite(ch[i].rectangle)

        // create possible positions item can be located
        for(let i=0; i < ch.length; i++){ //! burada refactoring yapilabilir
            if(ch[i].topRight.x < bbox.width){
                let modf = ch[i].topRight.add([0.5, 0.5]);
                if(!this.pointIntersects(modf).result)
                    possiblePositions.add(ch[i].topRight)
            }
            if(ch[i].bottomLeft.y < bbox.height){
                let modf = ch[i].bottomLeft.add([0.5, 0.5]);
                if(!this.pointIntersects(modf).result)
                    possiblePositions.add(ch[i].bottomLeft)
            }
            
            possiblePositions.delete(ch[i]);
        }
        
        let point = possiblePositions.getSmallest();
        // console.log(possiblePositions, point)
        if(!point)  return;

        let dd = this.intersects(new Rectangle(point, this.size));
        if(!dd.result && point.manhattan() <= this.point.manhattan())
            this.setPoint(point);
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
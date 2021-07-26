import {GABuilder} from "../ga/GABuilder"
import { Point } from "../geometry/Point";
import { draw } from "../main";
import Util from "../Utils/Utilities";
import paper from "paper";

const colors = ['red', 'green', 'blue', 'black', 'purple', 'brown', '#dddddd', '#444444', '#888888', '#bbbbbb', '#AB0902', '#104C90']
const step = 30;

export class SimpleLayout{
    
    ratio = 2;
    constructor(item_list){

        //this.findRatioWithPlacement(100, 1, 1);
        this.unitSize = this.getUnitSize(item_list);
        this.item_list = item_list;
        this.place_items(item_list)
        this.size = this.getSize();
        // this.draw_items()
    }

    place_items(item_list){

        let size = this.unitSize;
        let result = this.findRatioWithPlacement(item_list.length, size.width, size.height);

        let counter = 0;

        let y = 0;
        for(y=0; y < result.complete; y++)
            for(let x=0; x < result.length; x++)
            {
                // console.log(new Point(x * size.width, y * size.height))
                item_list[counter++].point = new Point(x * size.width, y * size.height);
            }
            
        for(let x=0; x < result.remain; x++) 
        {
            item_list[counter++].point = new Point(x * size.width, y * size.height);
            // console.log(new Point(x * size.width, y * size.height))
        }
    }

    getSize(){
        let result = this.findRatioWithPlacement(this.item_list.length, this.unitSize.width, this.unitSize.height);

        if (result.remain > 0)
        //     console.log("resulting ratio", (heu * width) / (height * (complete + 1)));
            return new Point(result.length * this.unitSize.width, (result.complete + 1) * this.unitSize.height)
        else 
            return new Point(result.length * this.unitSize.width, result.complete * this.unitSize.height)
        //     console.log("resulting ratio", (heu * width) / (height * complete));
    }

    draw_items(){

        const drawBlock = (item, beautify = false, color) => {

            var block, textCenter, textId;
            if(beautify)
            {
                block = new paper.Path.Rectangle({point: item.point.multiply(step), size: new Point(this.unitSize.width, this.unitSize.height).multiply(step), strokeWidth: 2, strokeColor: 'black', fillColor: color})
        
                var fontSize = Math.min(this.unitSize.x, this.unitSize.y) * step * 0.75;
                var textCenter = new paper.PointText({fontSize: fontSize/2 + 'px', fillColor: '#dddddd', content: item.name, opacity: 1});  
                textCenter.style = {strokeColor: 'black', strokeWidth: .5};
                textCenter.position = block.position;
                
                // var textId = new paper.PointText({fontSize: '20px', fillColor: '#ffffff', content: item.name+ ''});  
                // textId.position = block.bounds.topLeft.add([14,18]);
    
                this.drawing = new paper.Group(block, textId, textCenter);
            }
            else
            {
                this.drawing = new paper.Path.Rectangle({point: this.point.multiply(step), size: this.unitSize.multiply(step), strokeWidth: 2, strokeColor: 'black'}) //, fillColor: colors[this.id % colors.length]})
            }
    
            this.drawing.onMouseDown = (event) => {
                console.log(this.id, this.placed)
            }
    
            this.drawing.onClick = (event) => {
                console.log(this.id, this.content)
                alert(item.name+' '+ JSON.stringify(this.unitSize))
            }
    
            this.drawing.onDoubleClick = (event) => {
                console.log(this.id, this.content)
            }
        }
    
        let rand = Util.getRandomInt(0, 12);
        console.log(this.item_list)

        this.item_list.forEach(it => {
            drawBlock(it, true, colors[rand % colors.length])
        })
        
    }

    move(shift){
        this.item_list.forEach(it => {
            it.point = shift.add(it.point);
        })
    }

    findHeuristic(width, height, amount, ratio) {
        let heu = Math.sqrt((height * ratio * amount) / width);
        return Math.round(heu);
    }
      
    findRatioWithPlacement(amount, width, height) {
        // amount = total number of item, width of each item, height of each item
        let heu = this.findHeuristic(width, height, amount, this.ratio);
        // console.log("heuristic", heu);
      
        let complete = Math.floor(amount / heu);
        let remain = amount % heu;
        
        return {length: heu, complete: complete, remain: remain};
    }
    
    getUnitSize(item_list){
        let myMap = new Map();

        item_list.forEach(it => {
            if(it instanceof GABuilder)
            {
                let bbox = it.genePool[0].bbox;
                let temp = myMap.get(bbox.width +'x'+ bbox.height) || 0;
                myMap.set(bbox.width +'x'+ bbox.height, ++temp);    
            }
            else
            {
                let temp = myMap.get(it.getSize().x +'x'+ it.getSize().y) || 0;
                myMap.set(it.getSize().x +'x'+ it.getSize().y, ++temp);
            }
        });

        let size;
        myMap.forEach((value, key) => {size = key});
        return {width: size.split('x')[0], height: size.split('x')[1]};
    }

    static isItIdentical(item_list){
        let myMap = new Map();

        item_list.forEach(it => {

            if(it instanceof GABuilder)
            {
                let bbox = it.genePool[0].bbox;
                let temp = myMap.get(bbox.width +'x'+ bbox.height) || 0;
                myMap.set(bbox.width +'x'+ bbox.height, ++temp);    
            }
            else
            {
                let temp = myMap.get(it.getSize().x +'x'+ it.getSize().y) || 0;
                myMap.set(it.getSize().x +'x'+ it.getSize().y, ++temp);
            }
        });

        return myMap.size == 1;
    }
}
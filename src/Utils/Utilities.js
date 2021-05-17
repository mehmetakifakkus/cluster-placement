import paper from "paper";
import {Point} from "../geometry/Point"
const sizes = [1,2,3,4,6,8,12,16,24];
const environment = new paper.Point(32, 30)

function drawCoordinateSystem(width, height, step){

    for(var  i = 1; i <= height; i++){
        new paper.Path.Line({from: new Point(0, i * step), to: new Point(width * step, i * step), strokeColor:'black', strokeWidth: 1, dashArray: [1,2], opacity: 0.2})

        if(i % 5 == 0)
            new paper.PointText({point: (new Point(0, i * step)).add([-2, +3]), fontSize: '12px', fillColor: 'black', content: ' '+ i, opacity: 0.6});  
    }
    for(var i = 1; i <= width; i++){
        new paper.Path.Line({from: [i * step, 0], to: [i * step, height * step], strokeColor:'black', strokeWidth: 1, dashArray: [1,2], opacity: 0.2})

        if(i % 5 == 0)
            new paper.PointText({point: (new Point(i * step, 0)).add([-8, 12]), fontSize: '12px', fillColor: 'black', content: ' '+ i, opacity: 0.6});  
    }
    new paper.Layer();
}
    
function getRandomSize(){
        
        var s1 = getRandomInt(0, sizes.length - 1);
        var s2 = getRandomInt(0, sizes.length - 1);
        
        return new Point(sizes[s1], sizes[s2]);
}
    
function getRandomPos(){
    
    var s1 = getRandomInt(0, environment.x - 6);
    var s2 = getRandomInt(0, environment.y - 6);
    
    return new Point(s1, s2);
}

function shuffle(a) {
    var result = [], j, i, temp = a.slice(0); // copy the content
    
    for (var i = temp.length; i; i--) {
        j = Math.floor(Math.random() * i);
        result.push(temp[j])
        temp.splice(j, 1) //bu eksiltme işlemi burada gerçekleşiyor
    }
    return result;
}

Array.prototype.clear = function() {
    while (this.length) {
        this.pop();
    }
}

Array.prototype.one = function(){
    return this[getRandomInt(0, this.length)];
}

///////////////////////////////////    Math    //////////////////////////////////////////

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;  //! right?
}

function getRandomIntN(start, end, amount){
    var numbers = []
    for(var i=0; i < amount; i++)
        numbers.push(getRandomInt(start, end))

    return numbers;
}

export default {drawCoordinateSystem, getRandomPos, getRandomSize, getRandomInt, getRandomIntN, shuffle}
    
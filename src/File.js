import {getClosestRatio5, getClosestRatio10} from './Utils/Ratios'
import {Point} from './geometry/Point'

export class File{

    constructor(name, width, height){
        this.name = name;
        this.setWidth(width);
        this.setHeight(height);
        this.simplifyDimensions();
    }
    
    setWidth(width){
        this.width = width;
    }

    setHeight(height){
        this.height = height;
    }

    simplifyDimensions(){

        const gcd = function(a, b) {
            if (!b) {
              return a;
            }
          
            return gcd(b, a % b);
          }

        const result = gcd(this.width, this.height);
        
        this.simplified  = {width: this.width / result, height: this.height / result};

        if(this.simplified.width > 10 || this.simplified.height > 10)
        {
            this.simplified = getClosestRatio10(this.width, this.height);
        }

        if(this.simplified.width > 5 || this.simplified.height > 5)
        {
            this.simplified5 = getClosestRatio5(this.width, this.height);
        }
    }

    static getSizeList(file_list){
        return file_list.map(it =>{
            return new Point(it.simplified.width, it.simplified.height);
        })
    }

    static getNameList(file_list){
        return file_list.map(it => it.name)
    }
}
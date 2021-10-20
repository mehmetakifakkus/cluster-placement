import paper from 'paper';

import { GABuilder } from '../ga/GABuilder';
import { Point } from '../geometry/Point';
import Util from './Utilities';

const colors = ['red', 'green', 'blue', 'black', 'purple', 'brown', '#dddddd', '#444444', '#888888', '#bbbbbb', '#AB0902', '#104C90'];
const step = 30;

export class SimpleLayout {
    constructor(itemList) {
    // this.findRatioWithPlacement(100, 1, 1);
        this.ratio = 2;
        this.unitSize = this.getUnitSize(itemList);
        this.itemList = itemList;
        this.size = this.getSize();
        this.placeItems();
    }

    placeItems() {
        const size = this.unitSize;
        const result = this.findRatioWithPlacement(this.itemList.length, size.width, size.height);

        let counter = 0;

        let y = 0;
        for (y = 0; y < result.complete; y++) {
            for (let x = 0; x < result.length; x++) {
                // console.log(new Point(x * size.width, y * size.height))
                this.itemList[counter++].point = new Point(x * size.width, y * size.height);
            }
        }
s
        for (let x = 0; x < result.remain; x++) {
            this.itemList[counter++].point = new Point(x * size.width, y * size.height);
            // console.log(new Point(x * size.width, y * size.height))
        }
    }

    getSize() {
        const result = this.findRatioWithPlacement(this.itemList.length, this.unitSize.width, this.unitSize.height);

        if (result.remain > 0) return new Point(result.length * this.unitSize.width, (result.complete + 1) * this.unitSize.height);
        return new Point(result.length * this.unitSize.width, result.complete * this.unitSize.height);
    //     console.log("resulting ratio", (heu * width) / (height * complete));
    }

    drawItems(shift) {
        const drawBlock = (item, beautify = false, color) => {
            const shiftedPoint = shift.add(item.point);

            let block;
            let textId;
            if (beautify) {
                block = new paper.Path.Rectangle({
                    point: shiftedPoint.multiply(step),
                    size: new Point(this.unitSize.width, this.unitSize.height).multiply(step),
                    strokeWidth: 2,
                    strokeColor: 'black',
                    fillColor: color,
                });

                const fontSize = Math.min(this.unitSize.x, this.unitSize.y) * step * 0.75;
                const textCenter = new paper.PointText({
                    fontSize: `${fontSize / 2}px`,
                    fillColor: '#dddddd',
                    content: item.name,
                    opacity: 1,
                });
                textCenter.style = { strokeColor: 'black', strokeWidth: 0.5 };
                textCenter.position = block.position;

                // var textId = new paper.PointText({fontSize: '20px', fillColor: '#ffffff', content: item.name+ ''});
                // textId.position = block.bounds.topLeft.add([14,18]);

                this.drawing = new paper.Group(block, textId, textCenter);
            } else {
                this.drawing = new paper.Path.Rectangle({
                    point: this.point.multiply(step),
                    size: this.unitSize.multiply(step),
                    strokeWidth: 2,
                    strokeColor: 'black',
                }); // , fillColor: colors[this.id % colors.length]})
            }

            this.drawing.onMouseDown = () => {
                console.log(this.id, this.placed);
            };

            this.drawing.onClick = () => {
                console.log(this.id, this.content);
                // alert(`${item.name} ${JSON.stringify(this.unitSize)}`);
            };

            this.drawing.onDoubleClick = () => {
                console.log(this.id, this.content);
            };
        };

        const rand = Util.getRandomInt(0, 12);
        // console.log(this.itemList)

        this.itemList.forEach((it) => {
            drawBlock(it, true, colors[rand % colors.length]);
        });
    }

    findHeuristic(width, height, amount, ratio) {
        const heu = Math.sqrt((height * ratio * amount) / width);
        return Math.round(heu);
    }

    findRatioWithPlacement(amount, width, height) {
    // amount = total number of item, width of each item, height of each item
        const heu = this.findHeuristic(width, height, amount, this.ratio);
        // console.log("heuristic", heu);

        const complete = Math.floor(amount / heu);
        const remain = amount % heu;

        return { length: heu, complete, remain };
    }

    getUnitSize(itemList) {
        const myMap = new Map();

        itemList.forEach((it) => {
            if (it instanceof GABuilder) {
                const { bbox } = it.genePool[0];
                let temp = myMap.get(`${bbox.width}x${bbox.height}`) || 0;
                myMap.set(`${bbox.width}x${bbox.height}`, ++temp);
            } else {
                let temp = myMap.get(`${it.getSize().x}x${it.getSize().y}`) || 0;
                myMap.set(`${it.getSize().x}x${it.getSize().y}`, ++temp);
            }
        });

        let size;
        myMap.forEach((value, key) => { size = key; });
        return { width: size.split('x')[0], height: size.split('x')[1] };
    }

    static isItIdentical(itemList) {
        const myMap = new Map();

        itemList.forEach((it) => {
            if (it instanceof GABuilder) {
                const { bbox } = it.genePool[0];
                let temp = myMap.get(`${bbox.width}x${bbox.height}`) || 0;
                myMap.set(`${bbox.width}x${bbox.height}`, ++temp);
            } else {
                let temp = myMap.get(`${it.getSize().x}x${it.getSize().y}`) || 0;
                myMap.set(`${it.getSize().x}x${it.getSize().y}`, ++temp);
            }
        });

        return myMap.size === 1;
    }

    getItemList() {
        return this.itemList;
    }
}

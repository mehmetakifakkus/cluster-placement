/* eslint-disable @typescript-eslint/no-shadow */
import paper from 'paper';

import { Point } from '../geometry/Point';
import { Rectangle } from '../geometry/Rectangle';
import Util, { PointSet } from '../Utils/Utilities';

const step = 30;
const environment = new Point(32, 30);
class Block extends Rectangle {
    constructor(parent, item, point_) {
        if (typeof Block.counter === 'undefined') Block.counter = 0;

        const point = point_ || (Util.getRandomPos());

        const getAppropriateSize = item => item.getSize();

        const size = getAppropriateSize(item); // || (Util.getRandomSize());

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

    getArea() {
        if (this.rectangle) return this.rectangle.area;

        return this.size.x * this.size.y;
    }

    getProbability() {
        return this.inverseRatio / this.parent.totalInverseRatio;
    }

    // ratio of totalBlockArea / blockArea
    getInverseRatio() {
        return this.inverseRatio;
    }

    intersects(item) {
        if (typeof item === 'undefined') {
            const { chromosome } = this.parent;

            for (let i = 0; i < chromosome.length; i++) {
                // if(chromosome[i] !== this && chromosome[i].placed)
                if (chromosome[i] !== this) {
                    if (chromosome[i].rectangle.intersects(this.rectangle)) {
                        return {
                            result: true,
                            item: chromosome[i],
                        };
                    }
                }
            }
        } else if (Array.isArray(item)) { // item represents all blocks (chromosome), this represents one specific block (gene)qh
            const chromosome = item;

            for (let i = 0; i < chromosome.length; i++) {
                if (chromosome[i] !== this) {
                    if (chromosome[i].rectangle.intersects(this.rectangle)) {
                        return {
                            result: true,
                            item: chromosome[i],
                        };
                    }
                }
            }
        } else if (item instanceof Rectangle) {
            const { chromosome } = this.parent;

            for (let i = 0; i < chromosome.length; i++) {
                if (chromosome[i] !== this) {
                    if (chromosome[i].rectangle.intersects(item.rectangle)) {
                        return {
                            result: true,
                            item: chromosome[i],
                        };
                    }
                }
            }
        } else if (item instanceof Block) if (item !== this) return { result: true, item };

        return { result: false, item };
    }

    pointIntersects(point) {
        const { chromosome } = this.parent;

        for (let i = 0; i < chromosome.length; i++) {
            const rect = chromosome[i].rectangle;
            if (rect.contains(new paper.Point(point.x, point.y))) return { result: true, item: chromosome[i] };
        }
        return { result: false };
    }

    putInside(position) {
    // if any dimension of the point below zero, make it zero
        const limitedByZero = Point.max(position, new Point(0, 0));
        // if any dimension of the point exceeds the sides, limit it to width and height
        const limitedBySides = Point.min(limitedByZero, environment.subtract(this.size));

        return limitedBySides;
    }

    changePosAbit(amount) {
        const amo = Math.round(amount) || 10;

        const delta = new Point(Util.getRandomInt(-amo, amo + 0.5), Util.getRandomInt(-amo, amo + 0.5));

        const revised = this.putInside(this.point.add(delta));
        this.setPoint(revised);
    }

    /*
      * Find block an available place by looking already placed blocks
      */
    changePosAbit2() {
        const ch = this.parent.chromosome;
        const possiblePositions = [];

        // look already placed ones
        for (let i = 0; i < this.id; i++) {
            possiblePositions.push(ch[i].topRight);
            possiblePositions.push(ch[i].bottomLeft);
        }

        const oldPosition = new Point(this.point.x, this.point.y);

        // let revised = this.putInside(possiblePositions.one());
        const revised = possiblePositions.one();
        this.setPoint(revised);

        for (let i = 0; i < 100 && this.intersects().result; i++) {
            // console.log(this.id + ', count:', i);
            // let revised = this.putInside(possiblePositions.one());
            const revised = possiblePositions.one();
            this.setPoint(revised);
        }

        if (this.intersects().result) this.setPoint(oldPosition);

        this.placed = true;
    }

    changePosAbit3() {
        const ch = this.parent.chromosome;
        const possiblePositions = new PointSet();

        let bbox = ch[0].rectangle;

        for (let i = 1; i < this.id; i++) bbox = bbox.unite(ch[i].rectangle);

        // create possible positions item can be located
        for (let i = 0; i < this.id; i++) { //! burada refactoring yapilabilir
            if (ch[i].topRight.x < bbox.width) {
                possiblePositions.add(ch[i].topRight);
            }
            if (ch[i].bottomLeft.y < bbox.height) {
                // possiblePositions.add(JSON.stringify({x: ch[i].bottomLeft.x, y: ch[i].bottomLeft.y}))
                // if(!this.pointIntersects(ch[i].bottomLeft).result)
                possiblePositions.add(ch[i].bottomLeft);
                // else
                // console.log(ch[i], 'bottomLeft intersects', this.pointIntersects(ch[i].bottomLeft))
            }

            possiblePositions.delete(ch[i]);
        }

        const point = possiblePositions.getOne();
        if (!point) return;

        const dd = this.intersects(new Rectangle(point, this.size));
        if (!dd.result) this.setPoint(point);
    }

    localSearch() {
        const ch = this.parent.chromosome;
        const possiblePositions = new PointSet();

        let bbox = ch[0].rectangle;

        for (let i = 1; i < this.id; i++) bbox = bbox.unite(ch[i].rectangle);

        // create possible positions item can be located
        for (let i = 0; i < ch.length; i++) { //! burada refactoring yapilabilir
            if (ch[i].topRight.x < bbox.width) {
                const modf = ch[i].topRight.add([0.5, 0.5]);
                if (!this.pointIntersects(modf).result) possiblePositions.add(ch[i].topRight);
            }
            if (ch[i].bottomLeft.y < bbox.height) {
                const modf = ch[i].bottomLeft.add([0.5, 0.5]);
                if (!this.pointIntersects(modf).result) possiblePositions.add(ch[i].bottomLeft);
            }

            possiblePositions.delete(ch[i]);
        }

        const point = possiblePositions.getSmallest();
        // console.log(possiblePositions, point)
        if (!point) return;

        const dd = this.intersects(new Rectangle(point, this.size));
        if (!dd.result && point.manhattan() <= this.point.manhattan()) this.setPoint(point);
    }

    draw(shift, beautify = false, color = '#650023') {
        const shiftedPoint = shift.add(this.point);
        let block;
        let textCenter;
        let textId;
        if (beautify) {
            block = new paper.Path.Rectangle({
                point: shiftedPoint.multiply(step),
                size: this.size.multiply(step),
                strokeWidth: 2,
                strokeColor: 'black',
                fillColor: color,
            });

            const fontSize = Math.min(this.size.x, this.size.y) * step * 0.75;
            textCenter = new paper.PointText({
                fontSize: `${fontSize / 2}px`,
                fillColor: '#dddddd',
                content: `${this.size.x}x${this.size.y}`,
                opacity: 1,
            });
            textCenter.style = { strokeColor: 'black', strokeWidth: 0.5 };
            textCenter.position = block.position;

            textId = new paper.PointText({ fontSize: '20px', fillColor: '#ffffff', content: `${this.id}` });
            textId.position = block.bounds.topLeft.add([14, 18]);

            this.drawing = new paper.Group(block, textId, textCenter);
        } else {
            this.drawing = new paper.Path.Rectangle({
                point: this.point.multiply(step),
                size: this.size.multiply(step),
                strokeWidth: 2,
                strokeColor: 'black',
            }); // , fillColor: colors[this.id % colors.length]})
        }

        this.drawing.onMouseDown = () => {
            console.log(this.id, this.placed);
        };

        this.drawing.onClick = () => {
            console.log(this.id, this.content);
            //   alert(`${this.id} ${JSON.stringify(this.content)}`);
        };

        this.drawing.onDoubleClick = () => {
            console.log(this.id, this.content);
        };

    // this.drawing.onMouseDrag = (event) =>{
    //     console.log(event.point)
    //     this.setPoint(event.point.x / environment.step, event.point.y / environment.step)
    //     this.drawing
    // }
    }

    remove() {
        if (this.drawing) this.drawing.remove();

        this.drawing = null;
    }
}

export default Block;

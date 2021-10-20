import paper from 'paper';

import { Point } from './Point';

export class Rectangle {
    constructor(point, size) {
        if (point instanceof Point && size instanceof Point) {
            this.point = point;
            this.size = size;
        } else { console.error('parameter error'); }

        this.setAll();
    }

    setAll() {
        this.x = this.point.x;
        this.y = this.point.y;

        this.height = this.size.y;
        this.width = this.size.x;

        // this.left = this.x;
        // this.right = this.x + this.width;
        // this.top = this.y;
        // this.bottom = this.y + this.height;

        // this.center = this.point.add(this.size.divide(2));
        // this.topLeft = this.point;
        this.topRight = this.point.add([this.width, 0]);
        this.bottomLeft = this.point.add([0, this.height]);
        // this.bottomRight = this.point.add(this.size);

        // this.leftCenter = this.point.add([0, this.height / 2]);
        // this.topCenter = this.point.add([this.width / 2, 0]);
        // this.rightCenter = this.point.add([this.width, this.height / 2]);
        // this.bottomCenter = this.point.add([this.width / 2, this.height]);

        this.area = this.getArea();
        this.rectangle = new paper.Rectangle({ point: this.point, size: this.size });
    }

    setSize(size) {
        this.size = size;
        this.setAll();
    }

    setPoint(point) {
        this.point = point;
        this.setAll();
    }

    getArea() {
        return this.width * this.height;
    }
}

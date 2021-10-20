/* eslint-disable consistent-return */
/* eslint-disable no-extend-native */
/* eslint-disable no-new */
/* eslint-disable no-use-before-define */
import paper from 'paper';

import { Point } from '../geometry/Point';

const environment = new paper.Point(32, 30);
export class PointSet {
    constructor() {
        this.list = [];
    }

    has(point) {
        for (let i = 0; i < this.list.length; i++) {
            if (this.list[i].x === point.x && this.list[i].y === point.y) {
                return true;
            }
        }
        return false;
    }

    add(point) {
        if (!this.has(point)) this.list.push(point);
    }

    delete(point) {
        for (let i = 0; i < this.list.length; i++) {
            if (this.list[i].x === point.x && this.list[i].y === point.y) {
                this.list.splice(i, 1);
            }
        }
    }

    getOne() {
        return this.list[Math.floor(Math.random() * this.list.length)];
    }

    getSmallest() {
        this.list.sort((a, b) => a.x + a.y - (b.x + b.y));
        return this.list[0];
    }

    getSmallestX() {
        this.list.sort((a, b) => a.x - b.x);
        return this.list[0];
    }

    getSmallestY() {
        this.list.sort((a, b) => a.y - b.y);
        return this.list[0];
    }

    toString() {
        return this.list;
    }
}

function drawCoordinateSystem(width, height, step) {
    for (let i = 1; i <= height; i++) {
        new paper.Path.Line({
            from: new Point(0, i * step),
            to: new Point(width * step, i * step),
            strokeColor: 'black',
            strokeWidth: 1,
            dashArray: [1, 2],
            opacity: 0.2,
        });

        if (i % 5 === 0) {
            new paper.PointText({
                point: (new Point(0, i * step)).add([-2, +3]),
                fontSize: '12px',
                fillColor: 'black',
                content: ` ${i}`,
                opacity: 0.6,
            });
        }
    }
    for (let i = 1; i <= width; i++) {
        new paper.Path.Line({
            from: [i * step, 0], to: [i * step, height * step], strokeColor: 'black', strokeWidth: 1, dashArray: [1, 2], opacity: 0.2,
        });

        if (i % 5 === 0) {
            new paper.PointText({
                point: (new Point(i * step, 0)).add([-8, 12]),
                fontSize: '12px',
                fillColor: 'black',
                content: ` ${i}`,
                opacity: 0.6,
            });
        }
    }

    new paper.Layer();
}

function getRandomPos() {
    const s1 = getRandomInt(0, environment.x - 6);
    const s2 = getRandomInt(0, environment.y - 6);

    return new Point(s1, s2);
}

function shuffle(a) {
    const result = []; let j;
    const temp = a.slice(0); // copy the content

    for (let i = temp.length; i; i--) {
        j = Math.floor(Math.random() * i);
        result.push(temp[j]);
        temp.splice(j, 1); // bu eksiltme işlemi burada gerçekleşiyor
    }
    return result;
}

Array.prototype.clear = () => {
    while (this.length) {
        this.pop();
    }
};

Array.prototype.one = () => this[getRandomInt(0, this.length)];

Set.prototype.getOne = () => {
    if (this.size === 0) return null;

    const getEntriesArray = this.entries();
    for (let i = 0; i < Math.random() * this.size - 1; i++) getEntriesArray.next();
    return getEntriesArray.next().value[0];
};

/// ////////////////////////////////    Math    //////////////////////////////////////////

function getRandomIntN(start, end, amount) {
    const numbers = [];
    for (let i = 0; i < amount; i++) {
        numbers.push(getRandomInt(start, end));
    }

    return numbers;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min; //! right?
}

export default { drawCoordinateSystem, getRandomPos, getRandomInt, getRandomIntN, shuffle };

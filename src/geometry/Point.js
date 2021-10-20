export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(p) {
        const p2 = new Point(this.x, this.y);
        if (p instanceof Point) {
            p2.x += p.x;
            p2.y += p.y;
        } else if (p instanceof Array) {
            p2.x += p[0];
            p2.y += p[1];
        }
        return p2;
    }

    subtract(p) {
        const p2 = new Point(this.x, this.y);
        if (p instanceof Point) {
            p2.x -= p.x;
            p2.y -= p.y;
        } else if (p instanceof Array) {
            p2.x -= p[0];
            p2.y -= p[1];
        }
        return p2;
    }

    multiply(num) {
        const p2 = new Point(this.x, this.y);
        p2.x *= num;
        p2.y *= num;
        return p2;
    }

    divide(num) {
        const p2 = new Point(this.x, this.y);
        p2.x /= num;
        p2.y /= num;
        return p2;
    }

    /// /////////  Properties  ////////////////////
    manhattan() {
        return this.x + this.y;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    angle() {
        console.log(Math.asin(this.y / this.length()) * (180 / Math.PI));
    }

    /// ////////  Tests  ///////////////////////////

    isInside(rect) {
        return rect.pos.x <= this.x && this.x <= rect.pos.x + rect.size.x
                    && rect.pos.y <= this.y && this.y <= rect.pos.y + rect.size.y;
    }

    /// ////////    Vector Math Functions //////////
    dot(p) {
        return this.x * p.x + this.y * p.y;
    }

    cross(p) {
        return this.x * p.y - this.y * p.x;
    }

    /// //////////// Static Methods ////////////////

    static max(p1, p2) {
        return new Point(Math.max(p1.x, p2.x), Math.max(p1.y, p2.y));
    }

    static min(p1, p2) {
        return new Point(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y));
    }

    static random() {
        return new Point(Math.random(), Math.random());
    }
}

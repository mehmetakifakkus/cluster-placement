import { Point } from './geometry/Point';

export class Panel {
    constructor(name, width, height) {
        this.name = name;
        this.setWidth(width);
        this.setHeight(height);
    }

    setWidth(width) {
        this.width = width;
    }

    setHeight(height) {
        this.height = height;
    }

    getSize() {
        return new Point(this.width, this.height);
    }

    static getNameList(fileList) {
        return fileList.map(it => it.name);
    }
}

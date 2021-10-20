/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-use-before-define */
import paper from 'paper';

import { File } from './File';
import { GABuilder } from './ga/GABuilder';
import { Point } from './geometry/Point';
import { Panel } from './Panel';
import { Cluster, FileCluster } from './Utils/FileCluster';
import { SimpleLayout } from './Utils/SimpleLayout';
import Util from './Utils/Utilities';

const environment = new paper.Point(32, 30);
const step = 30;

let ga = null;
let clusters = null;

const initialize = (fileTextList) => {
    paper.project.activeLayer.removeChildren();

    Util.drawCoordinateSystem(environment.x, environment.y, step);

    clusters = new FileCluster(generateFilePanelList(fileTextList));
    // console.log(clusters.arranged)
    // console.log(clusters.listed)
    // printMap(clusters.arranged)

    // !TODO: sonrasinda paneller ile dosyalar var, once panelleri koy cluster icinde

    const t0 = performance.now();
    // ga = fileGA(clusters.arranged, 'root')
    ga = fileGAList(clusters.listed);
    console.log(ga);

    if (ga instanceof GABuilder) {
        for (let i = 0; i < 100; i++) {
            ga.evolve();
        }
    }

    draw(ga, new Point(0, 0));
    const extracted = extract(ga, new Point(0, 0));
    console.log(extracted);

    const t1 = performance.now();
    console.log(`initialization took ${(t1 - t0).toFixed(3)} milliseconds.`);
};

// get files from the textBox
// and create the File object list
function generateFilePanelList(fileTextList) {
    return fileTextList.map((it) => {
        const splitted = it.split(',');
        if (splitted[0] === 'P') {
            return new Panel(splitted[1].trim(), 6, 3);
        }
        if (splitted.length === 3) return new File(splitted[0], splitted[1], splitted[2]);
        return new File(splitted[0], 1, 1);
    });
}

function extract(layout, point) {
    if (layout instanceof GABuilder) {
        return extractGA(layout, point);
    } if (layout instanceof SimpleLayout) {
        return extractSimple(layout, point);
    } return layout;
}

function extractSimple(sl, point = new Point(0, 0)) { // sl = simpleLayout
    // const itemList = sl.getItemList(); // shift item
    const list = sl.itemList.map((it) => {
        if (it instanceof File || it instanceof Panel) {
            it.position = it.point.add(point);
            return it;
        }
        return extract(it, it.point.add(point));
    });
    return list.flat(2);
}

function extractGA(ga, point = new Point(0, 0)) {
    const layout = ga.best();

    const list = [];

    layout.chromosome.forEach((it) => {
        if (it.content instanceof File || it.content instanceof Panel) {
            const { content } = it;
            content.position = it.point.add(point);
            list.push(content);
        } else {
            list.push(extract(it.content, it.point.add(point)));
        }
    });

    return list.flat(2);
}

function draw(layout, point) {
    if (layout instanceof GABuilder) {
        drawGA(layout, point);
    } else if (layout instanceof SimpleLayout) {
        drawSimple(layout, point);
    }
}

function drawSimple(sl, point = new Point(0, 0)) { // sl = simpleLayout
    sl.itemList.forEach((item) => { // since simple layout can be comprised of other simple and GA
        item.drawItems(point);
    });
}

function drawGA(ga, point = new Point(0, 0)) {
    const layout = ga.best();

    layout.chromosome.forEach((it) => {
        if (it.content instanceof File || it.content instanceof Panel) it.draw(point, true);
        else draw(it.content, it.point.add(point));
    });
}

// run genetic algorithm on clusters
// give each cluster a title
function fileGAList(cluster) {
    const itemList = [];

    cluster.children.forEach((item) => {
        if (item instanceof Cluster) itemList.push(fileGAList(item)); // add a cluster
        else itemList.push(item); // add a file
    });

    let layout = {};
    if (SimpleLayout.isItIdentical(itemList)) {
        layout = new SimpleLayout(itemList);
    // console.log(itemList)
    } else layout = new GABuilder(10, itemList);

    layout.title = cluster.name;
    // console.log(itemList, ' ---> ', ga)§
    return layout;
}

// eslint-disable-next-line no-unused-vars
function printMap(map) {
    for (const [key, value] of map) {
        if (value instanceof Map) {
            printMap(value);
            console.log(key);
        } else console.log(key, value);
    // burada biriktir ve harf sirasina koy
    // sonrasinda GA tarafina yolla
    }

    if (map.size > 1) console.log('biriken kisimlar GA ya gonderildi');
}

function getGA() {
    return ga;
}

function getClusters() {
    return clusters;
}

export { draw, getClusters, getGA, initialize };

import { GABuilder } from '../ga/GABuilder';
import { Point } from '../geometry/Point';

// Turns the nested GA layouts into absolute positions for drawing.
//
// Every GA lays its blocks out in its own coordinates, and a sub cluster is a
// single block of its parent whose size is the sub cluster's bounding box. So
// each cluster is shifted until the top-left corner of its bounding box sits
// on `origin` (the position of its block in the parent), and its sub clusters
// are placed the same way at the positions their blocks end up on.
//
// Returns every file block, each with the index of the cluster it belongs to.
// Placing the same cluster again gives the same result.
export function placeCluster(ga, origin, files = [], counter = { next: 0 }) {
  const blocks = ga.best().chromosome;
  const corner = blocks.reduce((min, b) => Point.min(min, b.point), blocks[0].point);
  const shift = origin.subtract(corner);
  const cluster = counter.next++;

  blocks.forEach((block) => block.setPoint(block.point.add(shift)));

  blocks.forEach((block) => {
    if (block.content instanceof GABuilder) placeCluster(block.content, block.point, files, counter);
    else files.push({ block, cluster });
  });

  return files;
}

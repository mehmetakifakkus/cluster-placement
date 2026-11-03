import { GABuilder } from '../ga/GABuilder';

// Builds the antd Tree data for a cluster: one node per GA, children are its
// sub clusters only. Files are not tree nodes, so they are left out entirely;
// a null entry in `children` makes rc-tree restart from the root and recurse
// forever (Maximum call stack size exceeded).
export function buildTreeData(ga) {
  const children = ga
    .best()
    .chromosome.filter((block) => block.content instanceof GABuilder)
    .map((block) => buildTreeData(block.content));

  return {
    title: ga.title,
    key: ga.id,
    data: ga,
    children: children.length > 0 ? children : null,
  };
}

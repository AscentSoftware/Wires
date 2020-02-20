import { Node, Graph } from './graph/Graph';
import { Option, some, none, isNone, getApplySemigroup, fromNullable, fold } from 'fp-ts/lib/Option';
import { getMonoid } from 'fp-ts/lib/Array';
import { pipe } from 'fp-ts/lib/pipeable';

/**
 * Topological sorting of a network based on Depth First Search
 *
 * @param graph, a graph
 * @see https://en.wikipedia.org/wiki/Topological_sorting
 */
const dfs = <T>(graph: Graph<T>): Option<Array<Node<T>>> => {
  const [nodes, edges] = graph;
  const hasPermanentNode: { [k: number]: boolean } = {};
  const hasVisitedNode: { [k: number]: boolean } = {};

  const semigroup = getApplySemigroup(getMonoid<Node<T>>());

  const getUnmarkedNode = <T>(nodes: Array<Node<T>>): Option<Node<T>> =>
    fromNullable(nodes.find(node => !hasPermanentNode[node.index]));

  const hasUnmarkedNodes = <T>(nodes: Array<Node<T>>): boolean =>
    nodes.find(node => !hasPermanentNode[node.index]) !== undefined;

  const visit = (node: Node<T>): Option<Array<Node<T>>> => {
    let sorted = some<Array<Node<T>>>([]);

    if (hasPermanentNode[node.index]) return sorted;
    if (hasVisitedNode[node.index]) return none;

    hasVisitedNode[node.index] = true;

    const neighbors = edges
      .filter(([source]) => source === node.index)
      .map(([_source, target]) => nodes.find(node => node.index === target));

    for (let i = 0; i < neighbors.length; i++) {
      const next = neighbors[i];
      if (next) {
        sorted = semigroup.concat(sorted, visit(next));
      }
      // TODO next is undefined if graph is malformed
    }

    hasVisitedNode[node.index] = false;
    hasPermanentNode[node.index] = true;
    return semigroup.concat(some([node]), sorted);
  };
  let sorted = some<Array<Node<T>>>([]);
  do {
    sorted = semigroup.concat(
      pipe(
        getUnmarkedNode(nodes),
        fold(
          () => sorted,
          node => visit(node),
        ),
      ),
      sorted,
    );
  } while (!isNone(sorted) && hasUnmarkedNodes(nodes));

  return sorted;
};

export default dfs;

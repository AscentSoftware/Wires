import dfs from './dfs';
import { Graph, node } from './graph/Graph';

it('gets ordered list', () => {
  const graph: Graph<string> = [
    [node(1, '1'), node(2, '2'), node(3, '3')],
    [
      [1, 2],
      [1, 3],
    ],
  ];
  const list = dfs(graph);
  expect(list).toStrictEqual({
    _tag: 'Some',
    value: [
      { index: 1, payload: '1' },
      { index: 2, payload: '2' },
      { index: 3, payload: '3' },
    ],
  });
});

it('has cycles', () => {
  const graph: Graph<string> = [
    [node(1, '1'), node(2, '2'), node(3, '3')],
    [
      [1, 2],
      [2, 3],
      [3, 1],
    ],
  ];
  const list = dfs(graph);
  expect(list).toStrictEqual({
    _tag: 'None',
  });
});

// from https://en.wikipedia.org/wiki/Topological_sorting
it('gets wikipedia ordering', () => {
  const graph: Graph<string> = [
    [
      node(5, '5'),
      node(7, '7'),
      node(3, '3'),
      node(11, '11'),
      node(8, '8'),
      node(2, '2'),
      node(9, '9'),
      node(10, '10'),
    ],
    [
      [5, 11],
      [7, 11],
      [7, 8],
      [3, 8],
      [3, 10],
      [11, 2],
      [11, 9],
      [11, 10],
      [8, 9],
    ],
  ];
  const list = dfs(graph);
  expect(list).toStrictEqual({
    _tag: 'Some',
    value: [
      { index: 3, payload: '3' },
      { index: 7, payload: '7' },
      { index: 8, payload: '8' },
      { index: 5, payload: '5' },
      { index: 11, payload: '11' },
      { index: 2, payload: '2' },
      { index: 9, payload: '9' },
      { index: 10, payload: '10' },
    ],
  });
});

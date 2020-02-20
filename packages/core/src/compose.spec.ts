import compose from './compose';

it('builds a network from simpler ones', () => {
  const left = {
    resources: {
      x: {},
      y: {},
    },
    lambdas: {
      a: {} as any,
      b: {} as any,
      c: {} as any,
    },
    links: {
      a: {
        effects: {
          x: {},
          z: {},
        },
        events: {
          w: {},
        },
      },
    },
    names: ['w', 'z'],
  };
  const right = {
    resources: {
      z: {},
    },
    lambdas: {
      d: {} as any,
      e: {} as any,
    },
    links: {},
    names: {},
  };
  const result = compose(left, right);
  expect(result).toStrictEqual({
    resources: {
      x: {},
      y: {},
      z: {},
    },
    lambdas: {
      a: {},
      b: {},
      c: {},
      d: {},
      e: {},
    },
    links: {
      a: {
        effects: {
          x: {},
          z: {},
        },
        events: {
          w: {},
        },
      },
    },
    names: ['w'],
  });
});

it('identity', () => {
  const network = {
    resources: {
      x: {},
      y: {},
    },
    lambdas: {
      a: {} as any,
      b: {} as any,
      c: {} as any,
    },
    links: {
      a: {
        effects: {
          x: {},
          z: {},
        },
        events: {
          w: {},
        },
      },
    },
    names: ['w', 'z'],
  };
  const empty = {
    resources: {},
    lambdas: {},
    links: {},
    names: {},
  };
  const rightIdResult = compose(network, empty);
  expect(rightIdResult).toStrictEqual(network);
  const leftIdResult = compose(empty, network);
  expect(leftIdResult).toStrictEqual(network);
});

it('symmetry', () => {
  const left = {
    resources: {
      x: {},
      y: {},
    },
    lambdas: {
      a: {} as any,
      b: {} as any,
      c: {} as any,
    },
    links: {
      a: {
        effects: {
          x: {},
          z: {},
        },
        events: {
          w: {},
        },
      },
    },
    names: ['w', 'z'],
  };
  const right = {
    resources: {
      z: {},
    },
    lambdas: {
      d: {} as any,
      e: {} as any,
    },
    links: {},
    names: {},
  };
  const leftRight = compose(left, right);
  const rightLeft = compose(right, left);
  expect(leftRight).toStrictEqual(rightLeft);
});

it('associativity', () => {
  const one = {
    resources: {
      x: {},
      y: {},
    },
    lambdas: {
      a: {} as any,
      b: {} as any,
      c: {} as any,
    },
    links: {
      a: {
        effects: {
          x: {},
          z: {},
        },
        events: {
          w: {},
        },
      },
    },
    names: ['w', 'z'],
  };
  const two = {
    resources: {
      z: {},
    },
    lambdas: {
      d: {} as any,
      e: {} as any,
    },
    links: {},
    names: {},
  };
  const three = {
    resources: {
      w: {},
    },
    lambdas: {},
    links: {},
    names: {},
  };
  expect(compose(one, compose(two, three))).toStrictEqual(compose(compose(one, two), three));
});

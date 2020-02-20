import { IsExact, assert } from 'conditional-type-checks';

import { Lambda } from './Resources';
import { Network } from './Network';
import { Resource } from './Resource';

import intersection from 'lodash/fp/intersection';
import union from 'lodash/fp/union';
import difference from 'lodash/fp/difference';
import mergeAll from 'lodash/fp/mergeAll';

/**
 * Extracts actions available for a given resource
 */
type Action<N extends string | number | symbol, R> = N extends never
  ? N
  : R extends Resource<N, infer A, any>
  ? A
  : never;

assert<IsExact<Action<'test', Resource<'test', { a: 'sometype' }, any>>, { a: 'sometype' }>>(true);

/**
 * Extracts events that a given resource can emit
 */
type Event<N extends string | number | symbol, R> = N extends never
  ? N
  : R extends Resource<N, any, infer E>
  ? E
  : never;

assert<IsExact<Event<'test', Resource<'test', any, { a: 'sometype' }>>, { a: 'sometype' }>>(true);

/**
 * Extracts effects from a lambda
 */
type Effect<L> = L extends Lambda<any, any, any, infer R> ? R : any;

assert<IsExact<Effect<Lambda<any, any, any, { a: 'sometype' }>>, { a: 'sometype' }>>(true);

/**
 * Extracts lambda input
 */
type Input<L> = L extends Lambda<any, infer R, any, any> ? R : any;

type Match<A, E> = A extends E ? true : false;

type Test1<N extends string | number | symbol, X1 extends Lambda<any, any, any, any>, Y2> = Match<
  Action<N, Y2>,
  Effect<X1>[N]
> extends true
  ? N
  : never;

type Test2<N extends string | number | symbol, X1 extends Lambda<any, any, any, any>, Y2> = Match<
  Event<N, Y2>,
  Input<X1>
> extends true
  ? N
  : never;

type Test<N extends string | number | symbol, X1 extends Lambda<any, any, any, any>, Y2> =
  | Test1<N, X1, Y2>
  | Test2<N, X1, Y2>;

function compose<X1 extends Lambda<any, any, any, any>, Y1, L1, N1, X2 extends Lambda<any, any, any, any>, Y2, L2, N2>(
  left: Network<X1, Y1, L1, N1>,
  right: Network<X2, Y2, L2, N2>,
): Network<
  X1 & X2,
  Y1 & Y2,
  L1 & L2,
  Omit<N1, Test<Extract<keyof N1, keyof Y2>, X1, Y2>> & Omit<N2, Test<Extract<keyof N2, keyof Y1>, X2, Y1>>
> {
  // get names that intersect at least one resource
  const leftNames = intersection<Test<Extract<keyof N1, keyof Y2>, X1, Y2> | string>(
    Object.keys(right.resources) as string[],
    // TODO fix type
    (left.names as unknown) as string[],
  );
  const rightNames = intersection<Test<Extract<keyof N1, keyof Y2>, X1, Y2> | string>(
    Object.keys(left.resources) as string[],
    // TODO fix type
    (right.names as unknown) as string[],
  );
  return {
    resources: mergeAll([left.resources, right.resources]),
    lambdas: mergeAll([left.lambdas, right.lambdas]),
    links: mergeAll([left.links, right.links]),
    names: union(
      difference((left.names as unknown) as string[], leftNames) as any,
      difference((right.names as unknown) as string[], rightNames) as any,
    ) as any,
  };
}

export default compose;

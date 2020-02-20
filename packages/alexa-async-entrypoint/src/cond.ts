import * as O from 'fp-ts/lib/Option';

import { pipe } from 'fp-ts/lib/pipeable';
import { Refinement } from 'fp-ts/lib/function';

export const when = <A, B extends A, C>(cond: Refinement<A, B>, f: (b: B) => C) => (item: A): O.Option<C> =>
  pipe(item, O.fromPredicate(cond), O.map(f));

export const getFirst = <A, B>(...options: Array<(a: A) => O.Option<B>>) => (a: A): O.Option<B> => {
  const M = O.getFirstMonoid<B>();
  return options.reduce((acc, next) => M.concat(acc, next(a)), M.empty);
};

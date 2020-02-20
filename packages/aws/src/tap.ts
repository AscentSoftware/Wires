import { HKT, Kind, Kind2, Kind3, URIS, URIS2, URIS3 } from 'fp-ts/lib/HKT';
import { IO } from 'fp-ts/lib/IO';
import { Monad, Monad1, Monad2, Monad2C, Monad3 } from 'fp-ts/lib/Monad';

import { Bifunctor2 } from 'fp-ts/lib/Bifunctor';

/**
 * Tap a monadic chain with any synchronous computation, then resume the computation from where it was left.
 *
 * @param F Monad
 * @param f a synchronous computation
 *
 */
export function tap<F extends URIS3>(
  F: Monad3<F>,
): <U, L, A>(f: (a: A) => IO<void>) => (fa: Kind3<F, U, L, A>) => Kind3<F, U, L, A>;
export function tap<F extends URIS2>(
  F: Monad2<F>,
): <L, A>(f: (a: A) => IO<void>) => (fa: Kind2<F, L, A>) => Kind2<F, L, A>;
export function tap<F extends URIS2, L>(
  F: Monad2C<F, L>,
): <A>(f: (a: A) => IO<void>) => (fa: Kind2<F, L, A>) => Kind2<F, L, A>;
export function tap<F extends URIS>(F: Monad1<F>): <A>(f: (a: A) => IO<void>) => (fa: Kind<F, A>) => Kind<F, A>;
export function tap<F>(F: Monad<F>): <A>(f: (a: A) => IO<void>) => (fa: HKT<F, A>) => HKT<F, A> {
  return f => fa => F.chain(fa, a => F.map(F.of(f(a)()), () => a));
}

/**
 * Tap the left branch of a monadic chain.
 */
export function tapL<F extends URIS2>(
  F: Bifunctor2<F>,
): <L, A>(f: (b: L) => IO<void>) => (fa: Kind2<F, L, A>) => Kind2<F, L, A> {
  return f => fa =>
    F.bimap(
      fa,
      l => {
        f(l)();
        // return the original error
        return l;
      },
      a => a,
    );
}

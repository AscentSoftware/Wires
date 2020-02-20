import * as T from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Either';
import * as TE from 'fp-ts/lib/TaskEither';
import * as W from 'fp-ts/lib/Writer';

import { Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT';

import { Monad1, Monad2, Monad2C } from 'fp-ts/lib/Monad';
import { pipe } from 'fp-ts/lib/pipeable';
import { getMonoid } from 'fp-ts/lib/Array';

export interface Probe<A> {
  (a: A): T.Task<void>;
}

export interface EndOptions {
  timeout?: number;
  onError?(error: TapError): void;
}

export interface TimeoutError {
  errorCode: 'timeout';
  timeout: number;
}

export interface ExecutionError {
  errorCode: 'execution';
  originalError: any;
}

export type TapError = TimeoutError | ExecutionError;

export type Taps = Array<Promise<E.Either<TapError, void>>>;

export type Observable1<M extends URIS, A> = W.Writer<Taps, Kind<M, A>>;
export type Observable2<M extends URIS2, L, A> = W.Writer<Taps, Kind2<M, L, A>>;

export const getTimeoutError = (timeout: number): TapError => ({ errorCode: 'timeout', timeout });
export const getExecutionError = (error: unknown): TapError => ({ errorCode: 'execution', originalError: error });

export interface ObservableM2<M extends URIS2> {
  readonly start: <L, A>(a: A) => Observable2<M, L, A>;
  readonly end: <L, A>(options?: EndOptions) => (wa: Observable2<M, L, A>) => Kind2<M, L, T.Task<A>>;
  readonly tap: <L, A>(f: Probe<E.Either<L, A>>) => (wa: Observable2<M, L, A>) => Observable2<M, L, A>;
  readonly map: <L, A, B>(f: (a: A) => B) => (wa: Observable2<M, L, A>) => Observable2<M, L, B>;
  readonly chain: <L, A, B>(f: (a: A) => Kind2<M, L, B>) => (fa: Observable2<M, L, A>) => Observable2<M, L, B>;
  readonly branch: <L, A, B>(
    f: (fa: Observable2<M, L, A>) => Observable2<M, L, B>,
  ) => (fa: Observable2<M, L, A>) => Observable2<M, L, B>;
}

export interface ObservableM1<M extends URIS> {
  readonly start: <A>(a: A) => Observable1<M, A>;
  readonly end: <A>(options?: EndOptions) => (wa: Observable1<M, A>) => Kind<M, T.Task<A>>;
  readonly tap: <A>(f: Probe<A>) => (wa: Observable1<M, A>) => Observable1<M, A>;
  readonly map: <A, B>(f: (a: A) => B) => (wa: Observable1<M, A>) => Observable1<M, B>;
  readonly chain: <A, B>(f: (a: A) => Kind<M, B>) => (fa: Observable1<M, A>) => Observable1<M, B>;
  readonly branch: <A, B>(
    f: (fa: Observable1<M, A>) => Observable1<M, B>,
  ) => (fa: Observable1<M, A>) => Observable1<M, B>;
}

// export function getObservableM<M extends URIS3>(M: Monad3<M>): ObservableM1<M>;
// export function getObservableM<M extends URIS3, L>(M: Monad3C<M, L>): ObservableM1<M>;
export function getObservableM<M extends URIS2>(
  M: Monad2<M>,
  toPromise: (fa: Kind2<M, any, any>) => Promise<any>,
): ObservableM2<M>;
export function getObservableM<M extends URIS2, L>(
  M: Monad2C<M, L>,
  toPromise: (fa: Kind2<M, any, any>) => Promise<any>,
): ObservableM2<M>;
export function getObservableM<M extends URIS>(
  M: Monad1<M>,
  toPromise: (fa: Kind<M, any>) => Promise<any>,
): ObservableM1<M>;
export function getObservableM<M extends URIS>(
  M: Monad1<M>,
  toPromise: (fa: Kind<M, any>) => Promise<any>,
): ObservableM1<M> {
  const writerM = W.getMonad<Taps>(getMonoid());
  return {
    start: a =>
      pipe(
        W.tell([] as Taps),
        W.map(() => M.of(a)),
      ),
    end: (options: EndOptions = {}) => wa =>
      pipe(
        W.listen(wa),
        W.map(([mainTask, taps]) => {
          let handle: NodeJS.Timeout;
          const timeout = (time: number): Promise<never> =>
            new Promise((_resolve, reject) => {
              handle = setTimeout(reject, time);
            });
          const tapTasks: TE.TaskEither<TapError, void> = pipe(
            TE.tryCatch(
              () => {
                // order is not important
                // since every tap is wrapped in try-catch, it returns all the results even if something fails
                const allTaps = Promise.all(taps)
                  .then(results => {
                    // TODO return an error if at least one fails, is it too strict?
                    // we could use a validation monoid instead
                    const firstError = results.find(E.isLeft);
                    return TE.fromEither(firstError || results[0]);
                  })
                  .finally(() => {
                    if (handle) clearTimeout(handle);
                  });
                if (options.timeout !== undefined) {
                  return Promise.race([timeout(options.timeout), allTaps]);
                }
                return allTaps;
              },
              // error is always of kind "timeout" since promises are wrapped in try-catch
              () => getTimeoutError(options.timeout!),
            ),
            TE.flatten,
            // report errors if any
            TE.mapLeft(error => {
              if (options.onError) options.onError(error);
              return error;
            }),
          );
          // exec main process first, then logs
          return pipe(M.map(mainTask, out => T.task.map(tapTasks, () => out)));
        }),
        W.evalWriter,
      ),
    tap: f => wa =>
      W.pass(
        writerM.map(wa, fa => {
          const promise = toPromise(fa);
          return [
            // return lazy evaluation, do not compute the same promise twice
            (() => promise) as any,
            (w: Taps): Taps => [
              ...w,
              promise.then(a => {
                const runProbe = TE.tryCatch(
                  () => f(a)(),
                  error => ({ errorCode: 'execution', originalError: error }),
                );
                return runProbe() as any;
              }),
            ],
          ];
        }),
      ),
    map: f => wa => W.writer.map(wa, a => M.map(a, f)),
    chain: f => wa => W.writer.map(wa, a => M.chain(a, f)),
    branch: f => wa =>
      W.pass(
        pipe(
          wa,
          W.map(a => {
            const wa2 = f(
              // start new computation
              pipe(
                W.tell([] as Taps),
                W.map(() => a),
              ),
            );
            return [
              W.evalWriter(wa2),
              // merge again with main computation
              (w: Taps) => [...w, ...W.execWriter(wa2)],
            ];
          }),
        ),
      ),
  };
}

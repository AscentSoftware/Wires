import * as E from 'fp-ts/lib/Either';

import { TaskEither, taskEither, flatten, rightTask, map as mapTE, mapLeft as mapLeftTE } from 'fp-ts/lib/TaskEither';
import { Task, of } from 'fp-ts/lib/Task';
import { Writer, map as mapW } from 'fp-ts/lib/Writer';
import { getObservableM, Taps, EndOptions, Probe } from '.';
import { pipe } from 'fp-ts/lib/pipeable';

const T = getObservableM(taskEither, fa => fa());

export type ObservableTaskEither<L, A> = Writer<Taps, TaskEither<L, A>>;

export const start: <L, A>(a: A) => ObservableTaskEither<L, A> = T.start;

const endTask: <L, A>(options?: EndOptions) => (wa: ObservableTaskEither<L, A>) => TaskEither<L, Task<A>> = T.end;

export const end = <L, A>(options?: EndOptions) => (wa: ObservableTaskEither<L, A>): TaskEither<L, A> =>
  pipe(endTask<L, A>(options)(wa), mapTE(rightTask), flatten);

export const tap: <L, A>(f: Probe<A>) => (wa: ObservableTaskEither<L, A>) => ObservableTaskEither<L, A> = <L, A>(
  f: Probe<A>,
) => (wa: ObservableTaskEither<L, A>): ObservableTaskEither<L, A> =>
  T.tap<L, A>(la =>
    pipe(
      la,
      E.fold(() => of(undefined), f),
    ),
  )(wa);

export const tapL: <L, A>(f: Probe<L>) => (wa: ObservableTaskEither<L, A>) => ObservableTaskEither<L, A> = <L, A>(
  f: Probe<L>,
) => (wa: ObservableTaskEither<L, A>): ObservableTaskEither<L, A> =>
  T.tap<L, A>(la =>
    pipe(
      la,
      E.fold(f, () => of(undefined)),
    ),
  )(wa);

export const map: <L, A, B>(f: (a: A) => B) => (wa: ObservableTaskEither<L, A>) => ObservableTaskEither<L, B> = T.map;

export const chain: <L, A, B>(
  f: (a: A) => TaskEither<L, B>,
) => (fa: ObservableTaskEither<L, A>) => ObservableTaskEither<L, B> = T.chain;

export const mapLeft: <L, M>(f: (a: L) => M) => <A>(wa: ObservableTaskEither<L, A>) => ObservableTaskEither<M, A> = <
  L,
  M
>(
  f: (a: L) => M,
) => <A>(wa: ObservableTaskEither<L, A>) => mapW<TaskEither<L, A>, TaskEither<M, A>>(mapLeftTE(f))(wa);

export const branch: <L, A, B>(
  f: (fa: ObservableTaskEither<L, A>) => ObservableTaskEither<L, B>,
) => (fa: ObservableTaskEither<L, A>) => ObservableTaskEither<L, B> = T.branch;

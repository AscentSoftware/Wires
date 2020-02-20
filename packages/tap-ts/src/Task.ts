import { Task, task, flatten } from 'fp-ts/lib/Task';
import { Writer } from 'fp-ts/lib/Writer';
import { getObservableM, Taps, EndOptions, Probe } from '.';

// TODO can I transform any monad in a Task monad?
const T = getObservableM(task, fa => fa());

/**
 * An `ObservableTask` is a task that can be observed.
 */
export type ObservableTask<A> = Writer<Taps, Task<A>>;

export const start: <A>(a: A) => ObservableTask<A> = T.start;

const endTask: <A>(options?: EndOptions) => (wa: ObservableTask<A>) => Task<Task<A>> = T.end;

export const end = <A>(options?: EndOptions) => (wa: ObservableTask<A>): Task<A> => flatten(endTask<A>(options)(wa));

export const tap: <A>(f: Probe<A>) => (wa: ObservableTask<A>) => ObservableTask<A> = T.tap;

export const map: <A, B>(f: (a: A) => B) => (wa: ObservableTask<A>) => ObservableTask<B> = T.map;

export const chain: <A, B>(f: (a: A) => Task<B>) => (fa: ObservableTask<A>) => ObservableTask<B> = T.chain;

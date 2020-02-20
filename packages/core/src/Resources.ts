import * as TE from 'fp-ts/lib/TaskEither';
import * as IO from 'fp-ts/lib/IO';
import { LambdaExecutionError } from '.';

export interface Sync<T, U> {
  invoke(arg: T): Promise<U>;
}

export interface AsyncResponse {
  statusCode: number; // 201 for accepted
  body: string;
}

// TODO only one consumers get the message
// TODO aws build can choose between SQS or Async Lambda depending on network config
// for example, if there is just one consumer, we do not need a queue
export interface Queue<T> extends Resource {
  put(arg: T): AsyncResponse;
  // TODO async lambda does not have peek and pop, of course
  // how can we generalize it?
  // peek(): T;
  // pop(): T;
}

// TODO singular?
export interface QueueEvents<T> {
  head: T;
}

export interface Auth<C, T> {
  getToken(creds: C): Promise<T>;
}

// database

interface Attribute<K> {
  name: K;
  type: string;
}

export interface Schema<N, S> {
  attributes: Array<Attribute<keyof S>>;
  pk: string;
  name: N;
}

interface Resource {
  [k: string]: (args: any) => any;
}

export interface Database<S> extends Resource {
  read(id: string): S;
  update(params: { id: string; change: Partial<S> }): S;
  create(item: Omit<S, 'id'>): Partial<S>;
  delete(id: string): S;
  query(search: any): Array<S>;
  upsert(params: { id: string; change: Partial<S> }): S;
}

// other db could have different events
export interface DatabaseEvents<S> {
  inserted: S;
  updated: [S, S]; // [new, old]
  deleted: S;
}

export interface HttpGet {
  kind: 'event';
  name: 'http-get';
}

export interface HttpPost {
  kind: 'event';
  name: 'http-post';
}

export interface ResourceEvent {
  kind: 'event';
  name: string;
}

// lambda

export interface LambdaOptions<N, X extends Event<any, any, any>, Y, E> {
  name: N;
  handler: (event: X, context: LambdaContext<E>, runtime: unknown) => Promise<Y>;
  effects: {
    [k in keyof E]: any; // TODO how to infer more properties
  };
  events: {
    [k in Sources<X>]: { [e in Events<k, X>]: any };
  };
  invokeSync?: boolean;
}

export interface Event<S, N, T> {
  name: N;
  source: S;
  payload: T;
}

// TODO I could use the same approach also for Effect<'db0', 'write', User>
// type T = Event<'db0', 'insert', {}> | Event<'db0', 'update' | 'delete', {}> | Event<'queue', 'event', {}>;
export type Sources<T extends Event<any, any, any>> = T['source'];
type Events<N extends string, T extends Event<any, any, any>> = T extends Event<N, any, any> ? T['name'] : never;
export type Payloads<T extends Event<any, any, any>> = T['payload'];

export type LambdaEffect<E extends (args: any) => any> = (
  data: Parameters<E>[0],
) => TE.TaskEither<LambdaExecutionError, ReturnType<E>>;

export type LambdaResource<E extends { [k: string]: (args: any) => any }> = { [k in keyof E]: LambdaEffect<E[k]> };

export interface Logger {
  debug(message: string, data: any, context?: any): IO.IO<void>;
  info(message: string, data: any, context?: any): IO.IO<void>;
  warn(message: string, data: any, context?: any): IO.IO<void>;
  error(message: string, data: any, context?: any): IO.IO<void>;
}

export type LambdaContext<E> = {
  [k in keyof E]: {
    [m in keyof E[k]]: LambdaEffect<E[k][m]>;
  };
} & { logger: Logger };

export type Lambda<N extends string, _X, Y, E> = {
  [name in N]: Pick<LambdaOptions<N, any, Y, E>, 'name' | 'handler'>;
};

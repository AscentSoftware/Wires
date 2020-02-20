import * as TE from 'fp-ts/lib/TaskEither';
import * as T from 'fp-ts/lib/Task';

import { pipe } from 'fp-ts/lib/pipeable';

import {
  lambda,
  Lambda,
  Link,
  Resource,
  Network,
  compose,
  Names,
  HttpPost,
  Event,
  AsyncResponse,
  Queue,
} from '@wires/core';
import gateway from '@wires/core/lib/gateway';
import queue from '@wires/core/lib/queue';

interface CanSendToQueue {
  queue: {
    put(event: any): AsyncResponse;
  };
}

interface Request {
  body: string;
}

interface Response {
  body: any;
  statusCode: number;
}

const senderLambda: Network<
  Lambda<'sender', Request, Response, CanSendToQueue>,
  {},
  Link<'sender', 'queue', 'gateway2'>,
  Names<'queue' | 'gateway2'>
> = lambda<'sender', Event<'gateway2', 'http-post', Request>, Response, CanSendToQueue>({
  name: 'sender',
  handler: (event, context, runtime: any) => {
    runtime.logger.info('Received event', event)();
    const data = JSON.parse(event.payload.body);

    const runTask = pipe(
      context.queue.put(data),
      TE.fold(
        () =>
          T.of({
            statusCode: 500,
            body: 'timeout',
          }),
        () =>
          T.of({
            statusCode: 201,
            body: 'Request accepted',
          }),
      ),
    );

    return runTask();
  },
  effects: {
    queue: {
      put: {},
    },
  },
  events: {
    gateway2: {
      'http-post': {},
    },
  },
});

const receiverLambda: Network<
  Lambda<'receiver', Request, Response, {}>,
  {},
  Link<'receiver', never, 'queue'>,
  Names<'queue'>
> = lambda<'receiver', Event<'queue', 'event', Request>, Response, {}>({
  name: 'receiver',
  handler: async (event, _context, runtime: any) => {
    runtime.logger.info('Received event', event)();
    return {
      statusCode: 200,
      body: { message: 'Do something' },
    };
  },
  effects: {},
  events: {
    queue: {
      event: {},
    },
  },
});

const httpGateway: Network<{}, Resource<'gateway2', never, HttpPost>, {}, {}> = gateway<'gateway2', HttpPost>({
  name: 'gateway2',
  events: {
    'http-post': {
      method: 'post',
      path: '/',
    },
  },
});

const eventQueue = queue<'queue', any, any>({ name: 'queue' });

export const queueNetwork: Network<
  Lambda<'sender', Request, Response, CanSendToQueue> & Lambda<'receiver', Request, Response, {}>,
  Resource<'queue', Queue<any>, any> & Resource<'gateway2', never, HttpPost>,
  Link<'sender', 'queue', 'gateway2'> & Link<'receiver', never, 'queue'>,
  {}
> = compose(compose(senderLambda, receiverLambda), compose(httpGateway, eventQueue));

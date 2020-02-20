import * as E from 'fp-ts/lib/Either';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';

import {
  lambda,
  Lambda,
  Link,
  Resource,
  Network,
  compose,
  Names,
  HttpGet,
  Event,
  LambdaExecutionError,
} from '@wires/core';

import gateway from '@wires/core/lib/gateway';
import createResource, { ResourceSpec } from '@wires/core/lib/createResource';

import { pipe } from 'fp-ts/lib/pipeable';

interface Request {
  body: string;
}

interface Response {
  body: string;
  statusCode: number;
}

interface Api extends ResourceSpec {
  fetch(req: Request): Response;
}

interface SendApiRequest {
  api: {
    fetch(req: Request): Response;
  };
}

// some unreliable external API
const api: Network<{}, Resource<'api', Api>, {}, {}> = createResource('api', {
  fetch(request, _context, runtime: any) {
    runtime.logger.info('Processing API request', request)();
    return T.of(
      E.right({
        statusCode: 200,
        body: 'I am the Lord of Chaos!',
      }),
    );
  },
});

const getErrorResponse = (error: LambdaExecutionError): Response => {
  switch (error.errorCode) {
    case 'TIMEOUT':
      return {
        statusCode: 500,
        body: `Timeout after ${error.timeout}ms`,
      };
    default:
      return {
        statusCode: 500,
        body: `Unknown error: ${JSON.stringify(error)}`,
      };
  }
};

const chaosLambda: Network<
  Lambda<'chaos', Request, Response, SendApiRequest>,
  {},
  Link<'chaos', 'api', 'chaos-gateway'>,
  Names<'chaos-gateway'>
> = lambda<'chaos', Event<'chaos-gateway', 'http-get', Request>, Response, SendApiRequest>({
  name: 'chaos',
  handler: async (event, context, runtime: any) => {
    const { fetch } = context.api;
    const { info } = context.logger;
    const runTask = pipe(
      T.of(event),
      T.chain(data => T.fromIO(info(`Running user-defined handler for ${runtime.functionName}`, data))),
      T.chain(() => fetch({ body: 'something' })),
      TE.map(response => ({
        statusCode: 200,
        body: response.body,
      })),
      // types force me to handle timeout properly!
      TE.mapLeft(data => {
        info(`Ops... API are taking too much time to respond...`, data)();
        return data;
      }),
      TE.mapLeft(getErrorResponse),
      TE.fold(T.of, T.of),
    );
    return await runTask();
  },
  effects: {
    api: {
      fetch: {
        // TODO not sure if I want it here
        // at least I should be able to change options without redeploying
        chaos: {
          minDelay: 0,
          maxDelay: 10000,
          probability: 1,
          isEnabled: true,
        },
      },
    },
  },
  events: {
    'chaos-gateway': {
      'http-get': {},
    },
  },
});

// gateway does not have any action
const chaosGateway: Network<{}, Resource<'chaos-gateway', never, HttpGet>, {}, {}> = gateway<'chaos-gateway', HttpGet>({
  name: 'chaos-gateway',
  events: {
    'http-get': {
      method: 'get',
      path: '/',
    },
  },
});

// probably we need event types with actual source or in link
export const chaosNetwork: Network<
  Lambda<'chaos', Request, Response, SendApiRequest>,
  Resource<'chaos-gateway', never, HttpGet> & Resource<'api', Api>,
  Link<'chaos', 'api', 'chaos-gateway'>,
  {}
> = compose(chaosLambda, compose(chaosGateway, api));

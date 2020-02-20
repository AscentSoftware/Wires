import { lambda, Lambda, Link, Resource, Network, compose, Names, HttpGet, Event } from '@wires/core';
import gateway from '@wires/core/lib/gateway';

interface Request {
  body: string;
}

interface Response {
  body: string;
  statusCode: number;
}

const sayHelloLambda: Network<
  Lambda<'hello', Request, Response, any>,
  {},
  Link<'hello', any, 'gateway'>,
  Names<'gateway'>
> = lambda<'hello', Event<'gateway', 'http-get', Request>, Response, any>({
  name: 'hello',
  handler: async (event, _context, runtime: any) => {
    // runtime provides a pipeable logger
    // plus other runtime info
    runtime.logger.info(`Running user-defined handler for ${runtime.functionName}`, event)();
    // return something
    return {
      statusCode: 200,
      body: `Hello World!`,
    };
  },
  effects: {},
  events: {
    gateway: {
      'http-get': {},
    },
  },
});

// gateway does not have any action
const httpGateway: Network<{}, Resource<'gateway', never, HttpGet>, {}, {}> = gateway<'gateway', HttpGet>({
  name: 'gateway',
  events: {
    'http-get': {
      method: 'get',
      path: '/',
    },
  },
});

// probably we need event types with actual source or in link
export const helloNetwork: Network<
  Lambda<'hello', Request, Response, any>,
  Resource<'gateway', never, HttpGet>,
  Link<'hello', any, 'gateway'>,
  {}
> = compose(sayHelloLambda, httpGateway);

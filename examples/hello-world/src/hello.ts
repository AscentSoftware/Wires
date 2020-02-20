import * as O from 'fp-ts/lib/Option';
import * as TE from 'fp-ts/lib/TaskEither';
import * as T from 'fp-ts/lib/Task';

import { pipe } from 'fp-ts/lib/pipeable';

import {
  lambda,
  Lambda,
  Database,
  Link,
  Resource,
  Network,
  compose,
  database,
  Names,
  HttpGet,
  HttpPost,
  Event,
} from '@wires/core';
import gateway from '@wires/core/lib/gateway';

interface User {
  name: string;
  surname: string;
}

interface CanRead {
  users: {
    read(name: string): User;
  };
}

interface Request {
  body: string;
}

interface Response {
  body: string;
  statusCode: number;
}

const sayHelloLambda: Network<
  Lambda<'say-hello', Request, Response, CanRead>,
  {},
  Link<'say-hello', 'users', 'gateway'>,
  Names<'users' | 'gateway'>
> = lambda<'say-hello', Event<'gateway', 'http-post', Request>, Response, CanRead>({
  name: 'say-hello',
  handler: (event, context) => {
    const name = event.payload.body;
    const runTask = pipe(
      context.users.read(name),
      TE.fold(
        () => T.of({ statusCode: 500, body: 'timeout!' }),
        user =>
          pipe(
            O.fromNullable(user),
            O.fold(
              () => ({
                statusCode: 404,
                body: 'Sorry, my mom says I should not speak to strangers!',
              }),
              user => ({
                statusCode: 200,
                body: `Hello, ${user.name} ${user.surname}`,
              }),
            ),
            T.of,
          ),
      ),
    );
    return runTask();
  },
  effects: {
    users: {
      get: {},
    },
  },
  events: {
    // tell which events from gateway are accepted
    gateway: {
      'http-post': {},
    },
  },
});

const usersDb: Network<{}, Resource<'users', Database<User>>, {}, {}> = database<'users', User>({
  name: 'users',
  attributes: [
    {
      name: 'name',
      type: 'S',
    },
    {
      name: 'surname',
      type: 'S',
    },
  ],
  pk: 'name',
});

// gateway does not have any action
const httpGateway: Network<{}, Resource<'gateway', never, HttpGet | HttpPost>, {}, {}> = gateway<
  'gateway',
  HttpGet | HttpPost
>({
  name: 'gateway',
  events: {
    'http-get': {
      method: 'get',
      path: '/',
    },
    'http-post': {
      method: 'post',
      path: '/',
    },
  },
});

// probably we need event types with actual source or in link
export const helloNetwork: Network<
  Lambda<'say-hello', Request, Response, CanRead>,
  Resource<'users', Database<User>> & Resource<'gateway', never, HttpGet | HttpPost>,
  Link<'say-hello', 'users', 'gateway'>,
  {}
> = compose(sayHelloLambda, compose(httpGateway, usersDb));

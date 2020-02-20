import * as TE from 'fp-ts/lib/TaskEither';
import * as T from 'fp-ts/lib/Task';

import { Network, Lambda, Link, Names, lambda, Event } from '@wires/core';
import { ResponseEvent } from 'alexa-smarthome-ts';

import { pipe } from 'fp-ts/lib/pipeable';

export interface Alexa {
  gateway: {
    send(event: ResponseEvent<any>): any;
  };
  identity: {
    getAccessToken(code: string): string;
  };
}

export interface ReadAccessCode {
  register: {
    get(code: any): any;
  };
}

export interface AcceptedResponse {
  statusCode: number;
  body: string;
}

const dispatcherHandler: Network<
  Lambda<'dispatcher', ResponseEvent<any>, AcceptedResponse, ReadAccessCode & Alexa>,
  {},
  Link<'dispatcher', 'gateway' | 'identity' | 'register', 'dispatch'>,
  Names<'gateway' | 'identity' | 'register' | 'dispatch'>
> = lambda<
  'dispatcher',
  Event<'dispatch', 'alexa-response', ResponseEvent<any>>,
  AcceptedResponse,
  ReadAccessCode & Alexa
>({
  name: 'dispatcher',
  handler: (event, context) => {
    // TODO token in input with actual response, otherwise I do not know where to send it
    // with token get userId and from registry retrieve accesscode if any
    // with access code get access token from identity
    // finally submit response to Gateway
    const runTask = pipe(
      context.gateway.send(event.payload),
      TE.fold(
        error =>
          T.of({
            statusCode: 500,
            body: `Alexa Gateway error. ${JSON.stringify(error)}`,
          }),
        () =>
          T.of({
            statusCode: 201,
            body: 'DONE',
          }),
      ),
    );

    return runTask();
  },
  effects: {
    gateway: {
      send: {},
    },
    identity: {
      getAccessToken: {},
    },
    register: {
      read: {},
    },
  },
  events: {
    dispatch: {
      'alexa-response': {},
    },
  },
});

export default dispatcherHandler;

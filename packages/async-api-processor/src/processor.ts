import * as O from 'fp-ts/lib/Option';
import * as TE from 'fp-ts/lib/TaskEither';
import * as T from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Either';

import { pipe } from 'fp-ts/lib/pipeable';

import { Network, Lambda, Link, Names, lambda, Event } from '@wires/core';
import { EndpointDirective } from 'alexa-smarthome-ts';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const uuid = require('uuid/v1');

export interface HttpRequest {
  url: string;
  method: 'POST';
  body: string;
}
export interface HttpResponse {
  statusCode: number;
  body: string;
}

export interface HttpCall {
  api: {
    fetch(data: HttpRequest): HttpResponse;
  };
}

export interface CanCreateRequest {
  requests: {
    upsert(params: { id: string; change: Partial<ApiRequest> }): AcceptedResponse;
  };
}

export interface AcceptedResponse {
  statusCode: number;
  body: string;
}

export interface ApiRequest {
  requestId: string;
  status: string;
  directive: EndpointDirective<any, any>;
  httpRequest: HttpRequest;
  timestamp: string;
  updated?: string;
}

const processorHandler: (
  toHttp: (requestId: string, directive: EndpointDirective<any, any>) => HttpRequest | null,
  isRequestAccepted: (req: HttpResponse, directive: EndpointDirective<any, any>) => boolean,
) => Network<
  Lambda<'async-processor', EndpointDirective<any, any>, AcceptedResponse, HttpCall & CanCreateRequest>,
  {},
  Link<'async-processor', 'api' | 'requests', 'defer'>,
  Names<'api' | 'requests' | 'defer'>
> = (toHttp, isRequestAccepted) =>
  lambda<
    'async-processor',
    Event<'defer', 'event', EndpointDirective<any, any>>,
    AcceptedResponse,
    HttpCall & CanCreateRequest
  >({
    name: 'async-processor',
    handler: (event, context) => {
      const directive = event.payload;
      const requestId = uuid();

      // TODO should I send errors somewhere?

      const runTask = pipe(
        O.fromNullable(toHttp(requestId, directive)),
        O.fold(
          () =>
            T.of({
              statusCode: 500,
              body: 'Cannot build request for API.',
            }),
          httpRequest =>
            pipe(
              context.api.fetch(httpRequest),
              TE.chain(httpResponse => {
                if (isRequestAccepted(httpResponse, directive)) {
                  // TODO should I add record before sending request? (race condition?)
                  // TODO throw error if already exists
                  return context.requests.upsert({
                    id: requestId,
                    change: {
                      status: 'PENDING',
                      timestamp: new Date().toISOString(),
                      directive,
                      httpRequest,
                    },
                  });
                }
                return T.of(
                  E.right({
                    statusCode: 201,
                    body: 'DONE',
                  }),
                );
              }),
              TE.fold(
                error =>
                  T.of({
                    statusCode: 500,
                    body: `Cannot complete request. ${JSON.stringify(error)}`,
                  }),
                () =>
                  T.of({
                    statusCode: 201,
                    body: 'DONE',
                  }),
              ),
            ),
        ),
      );

      return runTask();
    },
    effects: {
      api: {
        fetch: {},
      },
      requests: {
        upsert: {},
      },
    },
    events: {
      defer: {
        event: {},
      },
    },
  });

export default processorHandler;

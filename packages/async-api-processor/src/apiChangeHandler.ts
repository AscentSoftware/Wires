import * as O from 'fp-ts/lib/Option';
import * as TE from 'fp-ts/lib/TaskEither';
import * as T from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Either';

import { pipe } from 'fp-ts/lib/pipeable';

import { Network, Lambda, Link, Names, lambda, Event } from '@wires/core';
import { EndpointDirective, ResponseEvent, AlexaErrorResponse } from 'alexa-smarthome-ts';

import { HttpRequest, HttpResponse, AcceptedResponse, ApiRequest } from './processor';

export interface HttpCall {
  api: {
    fetch(data: HttpRequest): HttpResponse;
  };
}

export interface CanReadRequest {
  requests: {
    read(requestId: string): ApiRequest;
    update(requestId: string, change: Partial<ApiRequest>): ApiRequest;
  };
}

export interface SendAlexaGateway {
  dispatch: {
    put(data: ResponseEvent<any> | AlexaErrorResponse): AcceptedResponse;
  };
}

const apiChangeHandler: (
  getRequestId: (req: HttpRequest) => string,
  fromHttp: (
    req: HttpRequest,
    directive: EndpointDirective<any, any>,
  ) => ResponseEvent<any> | AlexaErrorResponse | null,
) => Network<
  Lambda<'api-change-handler', EndpointDirective<any, any>, AcceptedResponse, SendAlexaGateway & CanReadRequest>,
  {},
  Link<'api-change-handler', 'dispatch' | 'requests', 'hook'>,
  Names<'requests' | 'hook' | 'dispatch'>
> = (getRequestId, fromHttp) =>
  lambda<
    'api-change-handler',
    Event<'hook', 'http-post', HttpRequest>,
    AcceptedResponse,
    SendAlexaGateway & CanReadRequest
  >({
    name: 'api-change-handler',
    handler: (event, context) => {
      const httpRequest = event.payload;
      const requestId = getRequestId(httpRequest);

      const runTask = pipe(
        context.requests.read(requestId),
        TE.chain(registredRequest =>
          pipe(
            O.fromNullable(registredRequest),
            O.fold(
              () =>
                T.of(
                  E.right({
                    statusCode: 500,
                    body: `Cannot find request with id ${requestId}`,
                  }),
                ),
              registredRequest =>
                pipe(
                  O.fromNullable(fromHttp(httpRequest, registredRequest.directive)),
                  O.fold(
                    () =>
                      T.of(
                        E.right({
                          statusCode: 500,
                          body: `Cannot build Alexa Response`,
                        }),
                      ),
                    alexaResponse =>
                      pipe(
                        context.dispatch.put(alexaResponse),
                        TE.chain(() =>
                          context.requests.update({
                            id: requestId,
                            status: 'COMPLETED',
                            updated: new Date().toISOString(),
                          } as any),
                        ),
                        TE.map(() => ({
                          statusCode: 201,
                          body: 'DONE',
                        })),
                      ),
                  ),
                ),
            ),
          ),
        ),
        TE.fold(
          error =>
            T.of({
              statusCode: 500,
              body: `Cannot complete request ${JSON.stringify(error)}`,
            }),
          response => T.of(response),
        ),
      );

      return runTask();
    },
    effects: {
      dispatch: {
        put: {},
      },
      requests: {
        read: {},
        update: {},
      },
    },
    events: {
      hook: {
        'http-post': {},
      },
    },
  });

export default apiChangeHandler;

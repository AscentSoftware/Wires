import * as O from 'fp-ts/lib/Option';
import * as TE from 'fp-ts/lib/TaskEither';
import * as T from 'fp-ts/lib/Task';

import { pipe } from 'fp-ts/lib/pipeable';

import { Network, Lambda, Link, Names, lambda, Event } from '@wires/core';
import { EndpointDirective, ResponseEvent, AlexaErrorResponse } from 'alexa-smarthome-ts';

import getErrorResponse from 'alexa-utils/lib/response/getErrorResponse';
import getMessageId from 'alexa-utils/lib/directive/getMessageId';

import { INTERNAL_ERROR } from 'alexa-utils/lib/constants/errors';

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

export interface SendAlexaGateway {
  dispatch: {
    put(data: ResponseEvent<any> | AlexaErrorResponse): AcceptedResponse;
  };
}

export interface AcceptedResponse {
  statusCode: number;
  body: string;
}

const processorHandler: (
  toHttp: (req: EndpointDirective<any, any>) => HttpRequest | null,
  fromHttp: (
    req: HttpResponse,
    directive: EndpointDirective<any, any>,
  ) => ResponseEvent<any> | AlexaErrorResponse | null,
) => Network<
  Lambda<'processor', EndpointDirective<any, any>, AcceptedResponse, HttpCall & SendAlexaGateway>,
  {},
  Link<'processor', 'api' | 'dispatch', 'defer'>,
  Names<'api' | 'dispatch' | 'defer'>
> = (toHttp, fromHttp) =>
  lambda<
    'processor',
    Event<'defer', 'event', EndpointDirective<any, any>>,
    AcceptedResponse,
    HttpCall & SendAlexaGateway
  >({
    name: 'processor',
    handler: (event, context) => {
      const directive = event.payload;
      const runTask = pipe(
        O.fromNullable(toHttp(directive)),
        O.fold(
          () =>
            pipe(
              getErrorResponse(getMessageId(directive), {
                message: 'Cannot build request for API.',
                type: INTERNAL_ERROR,
              }),
              alexaError => context.dispatch.put(alexaError),
            ),
          httpRequest =>
            pipe(
              context.api.fetch(httpRequest),
              TE.chain(httpResponse =>
                pipe(
                  O.fromNullable(fromHttp(httpResponse, directive)),
                  O.fold(
                    () =>
                      getErrorResponse(getMessageId(directive), {
                        message: 'Cannot interpret API response.',
                        type: INTERNAL_ERROR,
                      }),
                    alexaResponse => alexaResponse,
                  ),
                  alexaResponse => context.dispatch.put(alexaResponse),
                ),
              ),
            ),
        ),
        TE.fold(
          error =>
            T.of({
              statusCode: 500,
              body: `Cannot send to Alexa Gateway: ${JSON.stringify(error)}.`,
            }),
          gatewayResponse =>
            T.of({
              statusCode: gatewayResponse.statusCode,
              body: `Sent to Alexa Gateway: ${gatewayResponse.body}`,
            }),
        ),
      );
      return runTask();
    },
    effects: {
      api: {
        fetch: {},
      },
      dispatch: {
        put: {},
      },
    },
    events: {
      defer: {
        event: {},
      },
    },
  });

export default processorHandler;

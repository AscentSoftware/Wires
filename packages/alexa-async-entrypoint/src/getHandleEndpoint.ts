import * as TE from 'fp-ts/lib/TaskEither';
import * as T from 'fp-ts/lib/Task';

import { pipe } from 'fp-ts/lib/pipeable';

import { EndpointDirective, AlexaResponse, AlexaErrorResponse } from 'alexa-smarthome-ts';

import { LambdaContext } from '@wires/core/src';
import { AsyncCall } from './entrypoint';

import getMessageId from 'alexa-utils/lib/directive/getMessageId';

const getHandleEndpoint: (
  c: LambdaContext<AsyncCall>,
) => (d: EndpointDirective<any, any>) => T.Task<AlexaResponse | AlexaErrorResponse> = context => directive =>
  pipe(
    context.defer.put(directive),
    TE.fold(
      error =>
        T.of({
          event: {
            header: {
              messageId: getMessageId(directive),
              name: 'ErrorResponse',
              namespace: 'Alexa',
              payloadVersion: '3',
            },
            payload: {
              type: 'INTERNAL_ERROR',
              message: `Cannot defer the response. ${JSON.stringify(error)}`,
            },
          },
        }),
      () =>
        T.of<AlexaResponse | AlexaErrorResponse>({
          event: {
            header: {
              messageId: getMessageId(directive),
              name: 'DeferredResponse',
              namespace: 'Alexa',
              payloadVersion: '3',
            },
            payload: {},
          },
        }),
    ),
  );

export default getHandleEndpoint;

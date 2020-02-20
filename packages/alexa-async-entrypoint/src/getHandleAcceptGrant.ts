import * as O from 'fp-ts/lib/Option';
import * as TE from 'fp-ts/lib/TaskEither';
import * as T from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Either';

import { pipe } from 'fp-ts/lib/pipeable';

import { LambdaContext, LambdaExecutionError } from '@wires/core';

import { AlexaResponse, AlexaErrorResponse, AcceptGrantDirective } from 'alexa-smarthome-ts';

import getToken from 'alexa-utils/lib/directive/getToken';
import getAuthCode from 'alexa-utils/lib/directive/getAuthCode';
import { CanReadAuth, RegisterAccessCode } from './entrypoint';

const getHandleAcceptGrant: (
  c: LambdaContext<CanReadAuth & RegisterAccessCode>,
) => (d: AcceptGrantDirective) => T.Task<AlexaResponse | AlexaErrorResponse> = context => directive =>
  pipe(
    O.fromNullable(getToken(directive)),
    O.fold(
      () =>
        T.of<AlexaResponse | AlexaErrorResponse>({
          event: {
            header: {
              messageId: directive.directive.header.messageId,
              name: 'ErrorResponse',
              namespace: 'Alexa.Authorization',
              payloadVersion: '3',
            },
            payload: {
              type: 'ACCEPT_GRANT_FAILED',
              message: 'Cannot find token in directive',
            },
          },
        }),
      token =>
        pipe(
          context.users.getUserFromToken(token),
          TE.chain(user =>
            pipe(
              O.fromNullable(user),
              O.fold(
                () =>
                  T.of(
                    E.left<LambdaExecutionError, never>({ errorCode: 'MALFORMED_EVENT', data: 'Token is not valid' }),
                  ),
                user => context.register.upsert({ id: user.id, change: { code: getAuthCode(directive) } }),
              ),
            ),
          ),
          TE.fold(
            error =>
              T.of({
                event: {
                  header: {
                    messageId: directive.directive.header.messageId,
                    name: 'ErrorResponse',
                    namespace: 'Alexa.Authorization',
                    payloadVersion: '3',
                  },
                  payload: {
                    type: 'ACCEPT_GRANT_FAILED',
                    message: `Cannot complete request. $${JSON.stringify(error)}`,
                  },
                },
              }),
            () =>
              T.of<AlexaResponse | AlexaErrorResponse>({
                event: {
                  header: {
                    messageId: directive.directive.header.messageId,
                    name: 'AcceptGrant.Response',
                    namespace: 'Alexa.Authorization',
                    payloadVersion: '3',
                  },
                  payload: {},
                },
              }),
          ),
        ),
    ),
  );

export default getHandleAcceptGrant;

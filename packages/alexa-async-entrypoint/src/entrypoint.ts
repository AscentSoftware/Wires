import * as O from 'fp-ts/lib/Option';
import * as T from 'fp-ts/lib/Task';

import { pipe } from 'fp-ts/lib/pipeable';
import { Network, Lambda, Link, Names, Resource } from '@wires/core';

import { getFirst, when } from './cond';

import { EndpointDirective, Directive, AlexaResponse, AlexaErrorResponse } from 'alexa-smarthome-ts';

import alexaHomeSkill, { AlexaHomeSkillEvent } from 'alexa-resources/lib/alexaHomeSkill';

import isAcceptGrantDirective from 'alexa-utils/lib/directive/isAcceptGrant';
import isEndpointDirective from 'alexa-utils/lib/directive/isEndpointDirective';
import getMessageId from 'alexa-utils/lib/directive/getMessageId';

import getHandleAcceptGrant from './getHandleAcceptGrant';
import getHandleEndpoint from './getHandleEndpoint';

interface User {
  id: string;
  name: string;
  surname: string;
}

export interface RegisterAccessCode {
  register: {
    // TODO
    upsert(params: { id: string; change: any }): any;
  };
}

export interface AsyncCall {
  defer: {
    put(event: EndpointDirective<any, any>): any;
  };
}

export interface CanReadAuth {
  users: {
    getUserFromToken(token: string): User;
  };
}

const asyncSkillHandler: <S extends string>(
  skillName: S,
) => Network<
  Lambda<'entrypoint', Directive, AlexaResponse | AlexaErrorResponse, RegisterAccessCode & AsyncCall & CanReadAuth>,
  Resource<S, never, AlexaHomeSkillEvent>,
  Link<'entrypoint', 'register' | 'defer' | 'users', S>,
  Names<'register' | 'defer' | 'users'>
> = <S extends string>(skillName: S) =>
  alexaHomeSkill<S, 'entrypoint', RegisterAccessCode & AsyncCall & CanReadAuth>({
    skillName,
    name: 'entrypoint',
    handler: (event, context) => {
      const directive = event.payload;

      const runTask = pipe(
        directive,
        getFirst(
          when(isAcceptGrantDirective, getHandleAcceptGrant(context)),
          when(isEndpointDirective, getHandleEndpoint(context)),
          // TODO add more
          // TODO handle ReportState (sync)
          // TODO handle Discover (sync)
        ),
        O.fold(
          () =>
            T.of<AlexaResponse | AlexaErrorResponse>({
              event: {
                header: {
                  messageId: getMessageId(directive),
                  name: 'ErrorResponse',
                  namespace: 'Alexa',
                  payloadVersion: '3',
                },
                payload: {
                  type: 'INTERNAL_ERROR',
                  message: 'Invalid directive',
                },
              },
            }),
          response => response,
        ),
      );

      return runTask();
    },
    effects: {
      register: {
        write: {},
      },
      defer: {
        put: {},
      },
      users: {
        getUserFromToken: {},
      },
    },
  });

export default asyncSkillHandler;

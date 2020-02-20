import { compose, Network, Lambda, Link, Names, Queue, Resource } from '@wires/core';

import { Directive, AlexaResponse, AlexaErrorResponse, EndpointDirective } from 'alexa-smarthome-ts';

import entrypoint, { RegisterAccessCode, AsyncCall, CanReadAuth } from './entrypoint';
import queue from '@wires/core/lib/queue';

export interface AcceptedResponse {
  statusCode: number;
  body: string;
}

const channel = queue<'defer', EndpointDirective<any, any>, AcceptedResponse>({ name: 'defer' });

const alexaAsyncEntrypoint: <S extends string>(
  skillName: S,
) => Network<
  Lambda<'entrypoint', Directive, AlexaResponse | AlexaErrorResponse, RegisterAccessCode & AsyncCall & CanReadAuth>,
  Resource<'defer', Queue<EndpointDirective<any, any>>, AcceptedResponse>,
  Link<'entrypoint', 'register' | 'defer' | 'users' | 'api', S>,
  Names<'register' | 'users'>
> = <S extends string>(skillName: S) => compose(entrypoint(skillName), channel);

export default alexaAsyncEntrypoint;

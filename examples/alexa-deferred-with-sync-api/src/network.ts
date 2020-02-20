import { compose, Network, Lambda, Link, Names, Resource, Database, Queue } from '@wires/core';

import {
  Directive,
  AlexaResponse,
  AlexaErrorResponse,
  EndpointDirective,
  ResponseEvent,
} from 'alexa-smarthome-ts';

import { RegisterAccessCode, AsyncCall, CanReadAuth } from 'alexa-async-entrypoint/lib/entrypoint';
import { AcceptedResponse, HttpCall, SendAlexaGateway } from 'sync-api-processor/lib/processor';
import { ReadAccessCode, Alexa } from 'alexa-async-dispatcher/lib/dispatcher';
import { AlexaGateway } from 'alexa-resources/lib/gateway';
import { AlexaIdentity } from 'alexa-resources/lib/identity';

import asyncEntrypoint from 'alexa-async-entrypoint';
import asyncDispatcher from 'alexa-async-dispatcher';
import syncApiProcessor from 'sync-api-processor';

import toHttp from './toHttp';
import fromHttp from './fromHttp';

// TODO hide gateway and identity and dispatcher queue
const network: Network<
  Lambda<'entrypoint', Directive, AlexaResponse | AlexaErrorResponse, RegisterAccessCode & AsyncCall & CanReadAuth> &
    Lambda<'processor', EndpointDirective<any, any>, AcceptedResponse, HttpCall & SendAlexaGateway> &
    Lambda<'dispatcher', ResponseEvent<any>, AcceptedResponse, ReadAccessCode & Alexa>,
  Resource<'defer', Queue<EndpointDirective<any, any>>, AcceptedResponse> &
    Resource<'register', Database<any>> &
    Resource<'gateway', AlexaGateway> &
    Resource<'identity', AlexaIdentity> &
    Resource<'dispatch', Queue<ResponseEvent<any>>, AcceptedResponse>,
  Link<'entrypoint', 'register' | 'defer' | 'users' | 'api', 'my-skill'> &
    Link<'processor', 'api' | 'dispatch', 'defer'> &
    Link<'dispatcher', 'gateway' | 'identity' | 'register', 'dispatch'>,
  Names<'users' | 'api'>
> = compose(asyncEntrypoint('my-skill'), compose(syncApiProcessor(toHttp, fromHttp), asyncDispatcher));

export default network;

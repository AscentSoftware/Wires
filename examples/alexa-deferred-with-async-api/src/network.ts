import { compose, Network, Lambda, Link, Names, Resource, Database, Queue } from '@wires/core';

import { Directive, AlexaResponse, AlexaErrorResponse, EndpointDirective, ResponseEvent } from 'alexa-smarthome-ts';

import { RegisterAccessCode, AsyncCall, CanReadAuth } from 'alexa-async-entrypoint/lib/entrypoint';
import { AcceptedResponse, HttpCall, SendAlexaGateway } from 'sync-api-processor/lib/processor';
import { ReadAccessCode, Alexa } from 'alexa-async-dispatcher/lib/dispatcher';
import { AlexaGateway } from 'alexa-resources/lib/gateway';
import { AlexaIdentity } from 'alexa-resources/lib/identity';

import asyncEntrypoint from 'alexa-async-entrypoint';
import asyncDispatcher from 'alexa-async-dispatcher';
import asyncApiProcessor from 'async-api-processor';

import toHttp from './toHttp';
import fromHttp from './fromHttp';
import isRequestAccepted from './isRequestAccepted';
import getRequestId from './getRequestId';
import { CanCreateRequest, ApiRequest } from 'async-api-processor/src/processor';
import { CanReadRequest } from 'async-api-processor/src/apiChangeHandler';

// TODO hide gateway and identity and dispatcher queue
const network: Network<
  Lambda<'entrypoint', Directive, AlexaResponse | AlexaErrorResponse, RegisterAccessCode & AsyncCall & CanReadAuth> &
    Lambda<'async-processor', EndpointDirective<any, any>, AcceptedResponse, HttpCall & CanCreateRequest> &
    Lambda<'api-change-handler', EndpointDirective<any, any>, AcceptedResponse, SendAlexaGateway & CanReadRequest> &
    Lambda<'dispatcher', ResponseEvent<any>, AcceptedResponse, ReadAccessCode & Alexa>,
  Resource<'defer', Queue<EndpointDirective<any, any>>, AcceptedResponse> &
    Resource<'register', Database<any>> &
    Resource<'gateway', AlexaGateway> &
    Resource<'identity', AlexaIdentity> &
    Resource<'dispatch', Queue<ResponseEvent<any>>, AcceptedResponse> &
    Resource<'requests', Database<ApiRequest>>,
  Link<'entrypoint', 'register' | 'defer' | 'users' | 'api', 'my-skill'> &
    Link<'async-processor', 'api' | 'requests', 'defer'> &
    Link<'api-change-handler', 'dispatch' | 'requests', 'hook'> &
    Link<'dispatcher', 'gateway' | 'identity' | 'register', 'dispatch'>,
  Names<'users' | 'api' | 'hook'>
> = compose(
  asyncEntrypoint('my-skill'),
  compose(asyncApiProcessor(toHttp, fromHttp, isRequestAccepted, getRequestId), asyncDispatcher),
);

export default network;

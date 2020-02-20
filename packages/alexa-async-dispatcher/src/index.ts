import { compose, Network, Lambda, Link, Resource, Database, Queue } from '@wires/core';

import { ResponseEvent } from 'alexa-smarthome-ts';

import registry from './registry';
import dispatcher, { AcceptedResponse, ReadAccessCode, Alexa } from './dispatcher';

import gateway, { AlexaGateway } from 'alexa-resources/lib/gateway';
import identity, { AlexaIdentity } from 'alexa-resources/lib/identity';
import queue from '@wires/core/lib/queue';

const dispatch = queue<'dispatch', ResponseEvent<any>, AcceptedResponse>({ name: 'dispatch' });

const grantRegistry: Network<
  Lambda<'dispatcher', ResponseEvent<any>, AcceptedResponse, ReadAccessCode & Alexa>,
  Resource<'register', Database<any>> &
    Resource<'gateway', AlexaGateway> &
    Resource<'identity', AlexaIdentity> &
    Resource<'dispatch', Queue<ResponseEvent<any>>, AcceptedResponse>,
  Link<'dispatcher', 'gateway' | 'identity' | 'register', 'dispatch'>,
  {}
> = compose(compose(dispatcher, registry), compose(compose(gateway, identity), dispatch));

export default grantRegistry;

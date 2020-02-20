import * as T from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Either';

import { Network, Resource } from '@wires/core';
import { ResponseEvent } from 'alexa-smarthome-ts';

import createResource, { ResourceSpec } from '@wires/core/lib/createResource';

export interface AcceptedResponse {
  statusCode: number;
  body: string;
}

export interface AlexaGateway extends ResourceSpec {
  send(data: ResponseEvent<any>): AcceptedResponse;
}

const alexaGateway: Network<{}, Resource<'gateway', AlexaGateway>, {}, {}> = createResource('gateway', {
  send(data, context) {
    // TODO implement logic to get access token from access code
    context.logger.info('ALEXA GATEWAY processing', data)();
    return T.of(
      E.right({
        statusCode: 201,
        body: 'OK',
      }),
    );
  },
});

export default alexaGateway;

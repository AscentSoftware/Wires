import { ResponseEvent, AlexaErrorResponse } from 'alexa-smarthome-ts/src';

import { EndpointDirective } from 'alexa-smarthome-ts';

import getMessageId from 'alexa-utils/lib/directive/getMessageId';
import getEndpointId from 'alexa-utils/lib/directive/getEndpointId';
import getCorrelationToken from 'alexa-utils/lib/directive/getCorrelationToken';

import { HttpRequest } from 'async-api-processor/lib/processor';

// TODO Either or TaskEither could be better types
// this handles push notification
const fromHttp: (
  httpRequest: HttpRequest,
  directive: EndpointDirective<any, any>,
) => ResponseEvent<'Alexa.PowerController'> | AlexaErrorResponse | null = (
  httpRequest: HttpRequest,
  directive: EndpointDirective<any, any>,
) => {
  // TODO handle errors
  const request = JSON.parse(httpRequest.body);
  return {
    context: {
      properties: [
        {
          name: 'powerState',
          namespace: 'Alexa.PowerController',
          timeOfSample: new Date().toISOString(),
          uncertaintyInMilliseconds: 0,
          value: request.state.on ? 'ON' : 'OFF',
        },
      ],
    },
    event: {
      endpoint: { endpointId: getEndpointId(directive) },
      header: {
        messageId: getMessageId(directive),
        name: 'Response',
        namespace: 'Alexa',
        payloadVersion: '3',
        correlationToken: getCorrelationToken(directive),
      },
      payload: {},
    },
  };
};

export default fromHttp;

import { HttpResponse } from 'sync-api-processor/lib/processor';
import { ResponseEvent, AlexaErrorResponse } from 'alexa-smarthome-ts';

import { EndpointDirective } from 'alexa-smarthome-ts';

import getErrorResponse from 'alexa-utils/lib/response/getErrorResponse';
import getMessageId from 'alexa-utils/lib/directive/getMessageId';
import getEndpointId from 'alexa-utils/lib/directive/getEndpointId';
import getCorrelationToken from 'alexa-utils/lib/directive/getCorrelationToken';

import { INTERNAL_ERROR, NO_SUCH_ENDPOINT } from 'alexa-utils/lib/constants/errors';

const getErrorType = (statusCode: number) => {
  switch (statusCode) {
    case 404:
      return NO_SUCH_ENDPOINT;
    default:
      return INTERNAL_ERROR;
  }
};

// TODO Either or TaskEither could be better types
const fromHttp: (
  res: HttpResponse,
  directive: EndpointDirective<any, any>,
) => ResponseEvent<'Alexa.PowerController'> | AlexaErrorResponse | null = (
  res: HttpResponse,
  directive: EndpointDirective<any, any>,
) => {
  switch (res.statusCode) {
    case 200:
      return {
        context: {
          properties: [
            {
              name: 'powerState',
              namespace: 'Alexa.PowerController',
              timeOfSample: new Date().toISOString(),
              uncertaintyInMilliseconds: 0,
              value: 'OFF',
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
    default:
      return getErrorResponse(getMessageId(directive), {
        message: 'Cannot interpret API response.',
        type: getErrorType(res.statusCode),
      });
  }
};

export default fromHttp;

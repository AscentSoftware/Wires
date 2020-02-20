import { EndpointDirective } from 'alexa-smarthome-ts';

import { HttpRequest } from 'sync-api-processor/lib/processor';

import isTurnOn from 'alexa-utils/lib/directive/isTurnOn';
import isTurnOff from 'alexa-utils/lib/directive/isTurnOff';
import getEndpointId from 'alexa-utils/lib/directive/getEndpointId';

// TODO here we can use Ramda or another library
// I want to keep it simple because the implementation is not relevant for what I want to show

// TODO instead of promise I could return an Either or TaskEither type
const toHttp: (directive: EndpointDirective<any, any>) => HttpRequest | null = (
  directive: EndpointDirective<any, any>,
) => {
  if (isTurnOn(directive)) {
    return {
      url: `http://example.com/api/${getEndpointId(directive)}`,
      method: 'POST',
      body: JSON.stringify({
        on: true,
      }),
    };
  } else if (isTurnOff(directive)) {
    return {
      url: `http://example.com/api/${getEndpointId(directive)}`,
      method: 'POST',
      body: JSON.stringify({
        on: false,
      }),
    };
  }
  // return null if not supported
  return null;
};

export default toHttp;

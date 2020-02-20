/**
 * @see https://developer.amazon.com/docs/device-apis/alexa-endpointhealth.html
 */

export const ENDPOINT_HEALTH = 'Alexa.EndpointHealth';

export type CONNECTIVITY_STATUS = 'OK' | 'UNREACHABLE';

declare module '../base/Capabilities' {
  interface Capabilities {
    [ENDPOINT_HEALTH]: true;
  }
}

declare module '../base/Properties' {
  interface Properties {
    [ENDPOINT_HEALTH]: {
      connectivity: { value: CONNECTIVITY_STATUS };
    };
  }
}

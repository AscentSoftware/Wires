/**
 * @see https://developer.amazon.com/docs/device-apis/alexa-powercontroller.html#turnon
 */
export interface TurnOnDirective {
  directive: {
    header: {
      namespace: string;
      name: 'TurnOn';
      payloadVersion: string;
      messageId: string;
    };
    endpoint: {
      scope: {
        type: string;
        token: string;
      };
      endpointId: string;
      cookie: {};
    };
    payload: {};
  };
}

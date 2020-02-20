/**
 * @see https://developer.amazon.com/docs/device-apis/alexa-powercontroller.html#turnoff
 */
export interface TurnOffDirective {
  directive: {
    header: {
      namespace: string;
      name: 'TurnOff';
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

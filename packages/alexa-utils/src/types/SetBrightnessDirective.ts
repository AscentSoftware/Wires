/**
 * @see https://developer.amazon.com/docs/device-apis/alexa-brightnesscontroller.html#setbrightness
 */
export interface SetBrightnessDirective {
  directive: {
    header: {
      namespace: string;
      name: 'SetBrightness';
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
    payload: {
      brightness: number;
    };
  };
}

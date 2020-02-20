/**
 * @see https://developer.amazon.com/docs/device-apis/alexa-brightnesscontroller.html#adjustbrightness
 */
export interface AdjustBrightnessDirective {
  directive: {
    header: {
      namespace: string;
      name: 'AdjustBrightness';
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
      brightnessDelta: number;
    };
  };
}

/**
 * @see https://developer.amazon.com/docs/device-apis/alexa-colorcontroller.html#setcolor
 */
export interface SetColorDirective {
  directive: {
    header: {
      namespace: string;
      name: 'SetColor';
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
      color: {
        hue: number;
        saturation: number;
        brightness: number;
      };
    };
  };
}

import { NAMES as N, NAMESPACES as NS, VERSION } from '../constants/interfaces';

export interface AlexaErrorResponse {
  event: {
    header: {
      messageId: string;
      name: typeof N.ErrorResponse;
      namespace: typeof NS.Alexa;
      payloadVersion: typeof VERSION;
    };
    payload?: any;
  };
}

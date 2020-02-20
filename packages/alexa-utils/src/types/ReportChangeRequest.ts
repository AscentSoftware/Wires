import { NAMESPACES as NS, NAMES as N, VERSION } from '../constants/interfaces'

export interface Property {
  namespace: string;
  name: string;
  value: string;
  timeOfSample?: string;
  uncertaintyInMilliseconds?: number;
}

export interface ReportChangeRequest {
  context: {
    properties: Property[];
  };
  event: {
    header: {
      namespace: typeof NS.Alexa;
      name: typeof N.Response;
      payloadVersion: typeof VERSION;
      messageId?: string;
      correlationToken?: string;
    }
    endpoint: {
      scope: {
        type: 'BearerToken';
        token: string;
      }
      endpointId: string;
    }
  }
  payload: {};
}

interface Context {
  properties: Property[];
}

interface Property {
  namespace: string;
  name: string;
  value: string;
  timeOfSample: string;
  uncertaintyInMilliseconds: number;
}

interface Header {
  namespace: string;
  name: string;
  payloadVersion: string;
  messageId: string;
  correlationToken?: string;
}

interface Endpoint {
  scope: Scope;
  endpointId: string;
}

interface Scope {
  type: string;
  token: string;
}

export interface AlexaResponse {
  event: {
    header: Header;
    payload?: any;
    endpoint?: Endpoint;
  };
  context?: Context;
}

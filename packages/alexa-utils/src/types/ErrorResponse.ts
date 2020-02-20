export interface Error {
  type: string;
  message: string;
}

export interface ErrorResponse {
  event: {
    header: {
      namespace: string;
      name: 'ErrorResponse';
      messageId: string;
      payloadVersion: string;
    };
    endpoint?: {
      endpointId: string;
    };
    payload: Error;
  };
}

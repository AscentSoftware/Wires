export interface BearerTokenScope {
  type: 'BearerToken';
  token: string;
}

export interface BearerTokenWithPartition {
  type: 'BearerTokenWithPartition';
  token: string;
  partition: string;
  userId: string;
}

export type Scope = BearerTokenScope | BearerTokenWithPartition;

// For an event, the token is only required for events sent to the Alexa event gateway.
// TODO in event make field mandatory
export interface Endpoint {
  scope?: Scope;
  endpointId: string;
  cookie?: {
    [key : string]: string;
  };
}

// TODO not every string as generic, limit to known NS and N
export interface Header<NS = string, N = string> {
  namespace: NS;
  name: N;
  messageId: string;
  correlationToken?: string;
  payloadVersion: string;
}

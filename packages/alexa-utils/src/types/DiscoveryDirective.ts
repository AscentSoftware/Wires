/**
 * @see https://developer.amazon.com/docs/device-apis/alexa-discovery.html
 */
export interface DiscoveryDirective {
  directive: {
    header: {
      namespace: string;
      name: 'Discover';
      payloadVersion: string;
      messageId: string;
    };
    payload: {
      scope: {
        type: string;
        token: string;
      };
    };
  };
}

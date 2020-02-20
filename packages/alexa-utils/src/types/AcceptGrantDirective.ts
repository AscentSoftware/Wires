/**
 * @see https://developer.amazon.com/docs/smarthome/authenticate-a-customer-permissions.html#steps-for-asynchronous-message-authentication
 */
export interface AcceptGrantDirective {
  directive: {
    header: {
      namespace: 'Alexa.Authorization';
      name: 'AcceptGrant';
      payloadVersion: string;
      messageId: string;
    };
    payload: {
      grant: {
        type: 'OAuth2.AuthorizationCode';
        code: string;
      },
      grantee: {
        type: 'BearerToken';
        token: string;
      }
    };
  };
}

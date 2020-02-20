/**
 * @see https://developer.amazon.com/docs/smarthome/state-reporting-for-a-smart-home-skill.html#report-state-when-alexa-requests-it
 */
export interface ReportStateDirective {
  directive: {
    header: {
      namespace: string;
      name: 'ReportState';
      payloadVersion: string;
      messageId: string;
      correlationToken: string;
    };
    endpoint: {
      scope: {
        type: string;
        token: string;
      };
      endpointId: string;
      cookie: {};
    };
    payload: {};
  };
}

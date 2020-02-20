// capability
export const ALEXA = 'Alexa';

// directives
export const REPORT_STATE_DIRECTIVE = 'ReportState';

declare module '../base/Directives' {
  interface Directives {
    [ALEXA]: {
      [REPORT_STATE_DIRECTIVE]: true;
    };
  }
}

declare module '../base/Payloads' {
  interface Payloads {
    [REPORT_STATE_DIRECTIVE]: {};
  }
}

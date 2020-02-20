import * as R from 'ramda';

import { ErrorPayload, ErrorResponse } from 'alexa-smarthome-ts';

const getErrorResponse = R.curry(
  (messageId: string, error: ErrorPayload): ErrorResponse => ({
    event: {
      header: {
        messageId,
        name: 'ErrorResponse',
        namespace: 'Alexa',
        payloadVersion: '3',
      },
      payload: error,
    },
  }),
);

export default getErrorResponse;

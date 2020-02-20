import * as R from 'ramda';

import { ACCEPT_GRANT_FAILED } from '../constants/errors';
import { NAMES as N, NAMESPACES as NS, VERSION } from '../constants/interfaces';

import { AcceptGrantErrorResponse } from 'alexa-smarthome-ts';

const getAcceptGrantError: (
  messageId: string,
  message: string,
) => AcceptGrantErrorResponse = R.applySpec<AcceptGrantErrorResponse>({
  event: {
    header: {
      messageId: R.nthArg(0),
      namespace: R.always(NS.Authorization),
      // tslint:disable-next-line:object-literal-sort-keys
      name: R.always(N.ErrorResponse),
      payloadVersion: R.always(VERSION),
    },
    payload: {
      message: R.nthArg(1),
      type: R.always(ACCEPT_GRANT_FAILED),
    },
  },
});

export default getAcceptGrantError;

import * as R from 'ramda';

import { AcceptGrantResponse } from 'alexa-smarthome-ts';
import { NAMES as N, NAMESPACES as NS, VERSION } from '../constants/interfaces';

const getAcceptGrantResponse: (
  messageId: string,
) => AcceptGrantResponse = R.applySpec<AcceptGrantResponse>({
  event: {
    header: {
      messageId: R.nthArg(0),
      namespace: R.always(NS.Authorization),
      // tslint:disable-next-line:object-literal-sort-keys
      name: R.always(N.AcceptGrantResponse),
      payloadVersion: R.always(VERSION),
    },
    payload: R.always({}),
  },
});

export default getAcceptGrantResponse;

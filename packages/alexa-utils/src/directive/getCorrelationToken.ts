import * as R from 'ramda';

import { Directive } from 'alexa-smarthome-ts';

const getCorrelationToken: (d: Directive) => string | undefined = R.path<
  string
>(['directive', 'header', 'correlationToken']);

export default getCorrelationToken;

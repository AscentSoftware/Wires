import * as R from 'ramda';

import { Directive } from 'alexa-smarthome-ts';

const getName: (d: Directive) => string = R.pathOr<string>('', [
  'directive',
  'header',
  'name',
]);

export default getName;

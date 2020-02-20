import * as R from 'ramda';

import { Directive, Unlock } from 'alexa-smarthome-ts';
import T from '../constants/directives';

const isUnlock = R.pathEq(['directive', 'header', 'name'], T.UNLOCK) as (
  x: Directive,
) => x is Unlock;

export default isUnlock;

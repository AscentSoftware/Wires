import * as R from 'ramda';

import { Directive, Lock } from 'alexa-smarthome-ts';
import T from '../constants/directives';

const isLock = R.pathEq(['directive', 'header', 'name'], T.LOCK) as (
  x: Directive,
) => x is Lock;

export default isLock;

import * as R from 'ramda';

import { Directive, TurnOff } from 'alexa-smarthome-ts';
import T from '../constants/directives';

const isTurnOff = R.pathEq(['directive', 'header', 'name'], T.TURN_OFF) as (
  x: Directive,
) => x is TurnOff;

export default isTurnOff;

import * as R from 'ramda';

import { Directive, TurnOn } from 'alexa-smarthome-ts';
import T from '../constants/directives';

const isTurnOn = R.pathEq(['directive', 'header', 'name'], T.TURN_ON) as (
  x: Directive,
) => x is TurnOn;

export default isTurnOn;

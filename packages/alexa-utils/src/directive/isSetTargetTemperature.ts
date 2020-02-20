import * as R from 'ramda';

import T from '../constants/directives';

import {
  Directive,
  SetTargetTemperature,
} from 'alexa-smarthome-ts';

const isSetTargetTemperature = R.pathEq(
  ['directive', 'header', 'name'],
  T.SET_TARGET_TEMPERATURE,
) as (x: Directive) => x is SetTargetTemperature;

export default isSetTargetTemperature;

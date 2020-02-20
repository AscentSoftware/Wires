import * as R from 'ramda';

import T from '../constants/directives';

import {
  AdjustTargetTemperature,
  Directive,
} from 'alexa-smarthome-ts';

const isSetTargetTemperature = R.pathEq(
  ['directive', 'header', 'name'],
  T.ADJUST_TARGET_TEMPERATURE,
) as (x: Directive) => x is AdjustTargetTemperature;

export default isSetTargetTemperature;

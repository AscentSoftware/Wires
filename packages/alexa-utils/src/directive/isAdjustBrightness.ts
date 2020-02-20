import * as R from 'ramda';

import T from '../constants/directives';

import { AdjustBrightness, Directive } from 'alexa-smarthome-ts';

const isAdjustBrightness = R.pathEq(
  ['directive', 'header', 'name'],
  T.ADJUST_BRIGHTNESS,
) as (x: Directive) => x is AdjustBrightness;

export default isAdjustBrightness;

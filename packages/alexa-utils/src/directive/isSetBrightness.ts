import * as R from 'ramda';

import T from '../constants/directives';

import { Directive, SetBrightness } from 'alexa-smarthome-ts';

const isSetBrightness = R.pathEq(
  ['directive', 'header', 'name'],
  T.SET_BRIGHTNESS,
) as (x: Directive) => x is SetBrightness;

export default isSetBrightness;

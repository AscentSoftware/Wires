import * as R from 'ramda';

import { Directive, SetColor } from 'alexa-smarthome-ts';
import T from '../constants/directives';

const isSetColorDirective = R.pathEq(
  ['directive', 'header', 'name'],
  T.SET_COLOR,
) as (x: Directive) => x is SetColor;

export default isSetColorDirective;

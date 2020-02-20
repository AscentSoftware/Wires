import * as R from 'ramda';

import T from '../constants/directives';

import { Directive, SetThermostatMode } from 'alexa-smarthome-ts';

const isSetThermostatMode = R.pathEq(
  ['directive', 'header', 'name'],
  T.SET_THERMOSTAT_MODE,
) as (x: Directive) => x is SetThermostatMode;

export default isSetThermostatMode;

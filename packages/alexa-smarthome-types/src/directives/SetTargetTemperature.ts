/**
 * @see https://developer.amazon.com/docs/device-apis/alexa-thermostatcontroller.html
 */

import { EndpointDirective } from '../skill/EndpointDirective';

export type SetTargetTemperature =
  EndpointDirective<'Alexa.ThermostatController', 'SetTargetTemperature'>;

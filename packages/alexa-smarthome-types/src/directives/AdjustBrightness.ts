/**
 * @see https://developer.amazon.com/docs/device-apis/alexa-brightnesscontroller.html
 */

import { EndpointDirective } from '../skill/EndpointDirective';

export type AdjustBrightness =
  EndpointDirective<'Alexa.BrightnessController', 'AdjustBrightness'>;

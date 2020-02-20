/**
 * @see https://developer.amazon.com/docs/device-apis/alexa-lockcontroller.html
 */

import { EndpointDirective } from '../skill/EndpointDirective';

export type Lock =
  EndpointDirective<'Alexa.LockController', 'Lock'>;

/**
 * @see https://developer.amazon.com/docs/device-apis/alexa-lockcontroller.html
 */

import { EndpointDirective } from '../skill/EndpointDirective';

export type Unlock =
  EndpointDirective<'Alexa.LockController', 'Unlock'>;

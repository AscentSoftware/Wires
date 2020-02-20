import * as R from 'ramda';

import { EndpointDirective } from 'alexa-smarthome-ts/lib/skill/EndpointDirective';

/**
 * Get the `endpointId` (used as the `applianceId`) from the event.
 *
 * @param  {Object} event
 * @return {String}
 */
const getEndpointId: (d: EndpointDirective<any, any>) => string = R.pathOr('', [
  'directive',
  'endpoint',
  'endpointId',
]);

export default getEndpointId;

import * as R from 'ramda';

import { Directive } from 'alexa-smarthome-ts';
import { EndpointDirective } from 'alexa-smarthome-ts/lib/skill/EndpointDirective';

const getMessageId: (
  d: Directive | EndpointDirective<any, any>,
) => string = R.pathOr<string>('', ['directive', 'header', 'messageId']);

export default getMessageId;

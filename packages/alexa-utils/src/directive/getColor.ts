import * as R from 'ramda';

import { Payloads, SetColor } from 'alexa-smarthome-ts';

const getColor: (d: SetColor) => Payloads['SetColor']['color'] | {} = R.pathOr({}, ['directive', 'payload', 'color']);

export default getColor;

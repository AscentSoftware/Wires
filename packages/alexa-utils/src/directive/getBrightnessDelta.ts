import * as R from 'ramda';

import { Directive } from '../types/Directive';

const getBrightnessDelta: (d: Directive) => number | undefined = R.path<number>(
  ['directive', 'payload', 'brightnessDelta'],
);

export default getBrightnessDelta;

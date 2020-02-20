import * as R from 'ramda';

import { Directive } from '../types/Directive';

const getBrightness: (d: Directive) => number | undefined = R.path<number>(['directive', 'payload', 'brightness']);

export default getBrightness;

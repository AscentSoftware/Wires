import * as R from 'ramda';

import { Directive } from '../types/Directive';

const getEndpoint: (d: Directive) => string | undefined = R.path<string>([
  'directive',
  'endpoint',
]);

export default getEndpoint;

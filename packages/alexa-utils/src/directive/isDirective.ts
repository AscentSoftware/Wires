import * as R from 'ramda';

import { Directive } from '../types/Directive';

const isDirective = R.has('directive') as (x: any) => x is Directive;

export default isDirective;

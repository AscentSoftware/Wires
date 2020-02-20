import * as R from 'ramda';

import T from '../constants/directives';

import {
  AcceptGrantDirective,
  Directive,
} from 'alexa-smarthome-ts';

const isAcceptGrant = R.pathEq(
  ['directive', 'header', 'name'],
  T.ACCEPT_GRANT,
) as (x: Directive) => x is AcceptGrantDirective;

export default isAcceptGrant;

import * as R from 'ramda';

import T from '../constants/directives';

import { Directive, DiscoveryDirective } from 'alexa-smarthome-ts';

const isDiscovery = R.pathEq(['directive', 'header', 'name'], T.DISCOVER) as (
  x: Directive,
) => x is DiscoveryDirective;

export default isDiscovery;

import * as R from 'ramda';

import { Directive } from 'alexa-smarthome-ts';
import { EndpointDirective } from 'alexa-smarthome-ts/lib/skill/EndpointDirective';

const hasPath = (path: string[]) =>
  R.compose(
    R.complement(R.isNil),
    R.path(path),
  );

const isEndpointDirective = hasPath(['directive', 'endpoint']) as (
  x: Directive,
) => x is EndpointDirective<any, any>;

export default isEndpointDirective;

import * as R from 'ramda';

import { TYPE, VERSION } from '../constants/interfaces';
import { Capability } from '../types/Endpoint';

const getCapability = (capability: any, property: any) =>
  R.applySpec<Capability>({
    interface: R.always(capability),
    properties: {
      proactivelyReported: R.T,
      retrievable: R.T,
      supported: R.compose(R.map(R.objOf('name')), R.always(property)),
    },
    type: R.always(TYPE),
    version: R.always(VERSION),
  })(capability, property);

export default getCapability;

import * as R from 'ramda';

import { Directive, ReportState } from 'alexa-smarthome-ts';
import T from '../constants/directives';

const isReportState = R.pathEq(
  ['directive', 'header', 'name'],
  T.REPORT_STATE,
) as (x: Directive) => x is ReportState;

export default isReportState;

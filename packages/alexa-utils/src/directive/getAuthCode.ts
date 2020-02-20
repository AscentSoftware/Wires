import * as R from 'ramda';

const getAuthCode = R.pathOr('', ['directive', 'payload', 'grant', 'code']);

export default getAuthCode;

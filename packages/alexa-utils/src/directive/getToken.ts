import * as R from 'ramda';

import { Directive } from 'alexa-smarthome-ts';

const getTokenFromGrantee = R.path([
  'directive',
  'payload',
  'grantee',
  'token',
]);
const getTokenFromPayload = R.path(['directive', 'payload', 'scope', 'token']);
const getTokenFromEndpoint = R.path([
  'directive',
  'endpoint',
  'scope',
  'token',
]);

/**
 * Looks for token in different places and returns the first one or `undefined`.
 */
const getToken: (d: Directive) => string | undefined = R.compose(
  R.find(R.complement(R.isNil)),
  R.juxt([getTokenFromEndpoint, getTokenFromPayload, getTokenFromGrantee]),
);

export default getToken;

import * as T from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Either';

import { Network, Resource } from '@wires/core';

import createResource, { ResourceSpec } from '@wires/core/lib/createResource';

export interface AlexaIdentity extends ResourceSpec {
  getAccessToken(code: string): string;
}

const alexaIdentity: Network<{}, Resource<'identity', AlexaIdentity>, {}, {}> = createResource('identity', {
  getAccessToken(code, context) {
    // TODO implement logic to get access token from access code
    context.logger.info('ALEXA IDENTITY processing', code)();
    return T.of(E.right('ACCESS_TOKEN'));
  },
});

export default alexaIdentity;

import * as E from 'fp-ts/lib/Either';
import * as t from 'io-ts';

import { pipe } from 'fp-ts/lib/pipeable';

import { getEventFromGateway } from './APIGatewayProxyEvent';
import { Event } from '@wires/core';

const getEvent: (s: any) => t.Encode<Event<any, any, any>, Event<any, any, any>> = source => request => {
  const {
    payload: { body },
  } = request;
  return {
    payload: JSON.parse(body || ''),
    source: source.name,
    name: source.event,
  };
};

// TODO I should build a decoder to check Alexa shape
// not so important, since it is unlikely to get malformed events from AWS
/**
 *
 * @param source
 * @deprecated alexa skill events do not come from gatewat
 */
export const getEventFromAlexaSkillGateway = (source: any) => (request: unknown) =>
  pipe(
    request,
    getEventFromGateway(source),
    E.map(request =>
      E.tryCatch(
        () => getEvent(source)(request),
        () => [{ value: request, context: {} as any, message: 'Request body is not in json' }],
      ),
    ),
    E.flatten,
  );

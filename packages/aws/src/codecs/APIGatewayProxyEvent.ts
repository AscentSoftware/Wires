import * as t from 'io-ts';
import * as E from 'fp-ts/lib/Either';

import { pipe } from 'fp-ts/lib/pipeable';
import { Event } from '@wires/core';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const base64 = require('base-64');

export const APIGatewayProxyEventCodec = t.type({
  body: t.union([t.string, t.null, t.undefined]),
  headers: t.union([t.UnknownRecord, t.null, t.undefined]),
  // multiValueHeaders: t.union([t.record(t.string, t.array(t.string)), t.undefined]),
  // httpMethod: t.string,
  isBase64Encoded: t.boolean,
  // path: t.string,
  // pathParameters: t.union([t.record(t.string, t.string), t.null, t.undefined]),
  // queryStringParameters: t.union([t.record(t.string, t.string), t.null, t.undefined]),
  // multiValueQueryStringParameters: t.union([t.record(t.string, t.array(t.string)), t.null, t.undefined]),
  // stageVariables: t.union([t.record(t.string, t.string), t.null, t.undefined]),
  // requestContext: t.union([t.UnknownRecord, t.undefined]),
  // resource: t.union([t.string, t.undefined]),
});

export type APIGatewayProxyEvent = t.TypeOf<typeof APIGatewayProxyEventCodec>;

const getEvent: (s: any) => t.Encode<APIGatewayProxyEvent, Event<any, any, any>> = source => request => {
  const { body, headers /* isBase64Encoded */ } = request;
  // for some reason isBase64Encoded === 0
  return {
    payload: { body: body /* && isBase64Encoded */ ? base64.decode(body) : body, headers },
    source: source.name,
    name: source.event,
  };
};

export const getEventFromGateway = (source: any) => (request: unknown) =>
  pipe(
    APIGatewayProxyEventCodec.decode(request),
    E.map(request =>
      E.tryCatch(
        () => getEvent(source)(request),
        () => [{ value: request, context: {} as any, message: 'Request body is not in base64' }],
      ),
    ),
    E.flatten,
  );

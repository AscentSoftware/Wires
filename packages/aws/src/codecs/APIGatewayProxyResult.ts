import * as t from 'io-ts';

export const APIGatewayProxyResultCodec = t.type({
  body: t.string,
  statusCode: t.number,
});

export type APIGatewayProxyResult = t.TypeOf<typeof APIGatewayProxyResultCodec>;

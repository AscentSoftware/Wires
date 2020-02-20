import { getEventFromGateway } from './APIGatewayProxyEvent';

it.skip('builds an event', () => {
  const event = getEventFromGateway({ name: 'gateway-1', event: 'http-post' })({
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'POST',
    isBase64Encoded: true,
    path: '/',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {},
    resource: 'something',
  });
  expect(event).toStrictEqual({
    _tag: 'Right',
    right: {
      payload: { body: null, headers: {}, path: '/' },
      source: 'gateway-1',
      name: 'http-post',
    },
  });
});

it.skip('builds an event with body decoded', () => {
  const event = getEventFromGateway({ name: 'gateway-1', event: 'http-post' })({
    body: 'aGVsbG8=', // encode "hello"
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'POST',
    isBase64Encoded: true,
    path: '/',
    pathParameters: undefined,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {},
    resource: 'something',
  });
  expect(event).toStrictEqual({
    _tag: 'Right',
    right: {
      payload: { body: 'hello', headers: {}, path: '/' },
      source: 'gateway-1',
      name: 'http-post',
    },
  });
});

it.skip('builds an event without decoding body', () => {
  const event = getEventFromGateway({ name: 'gateway-1', event: 'http-post' })({
    body: 'aGVsbG8=',
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/',
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {},
    resource: 'something',
  });
  expect(event).toStrictEqual({
    _tag: 'Right',
    right: {
      payload: { body: 'aGVsbG8=', headers: {}, path: '/' },
      source: 'gateway-1',
      name: 'http-post',
    },
  });
});

it.skip('throws an error', () => {
  const event = getEventFromGateway({ name: 'gateway-1', event: 'http-post' })({
    body: 'aGVsbG8=',
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'POST',
    isBase64Encoded: 'NON VALID',
    path: '/',
    pathParameters: undefined,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {},
    resource: 'something',
  });
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  expect(event.left).toBeDefined();
});

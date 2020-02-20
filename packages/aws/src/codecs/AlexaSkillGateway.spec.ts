import { getEventFromAlexaSkillGateway } from './AlexaSkillGateway';

it.skip('cannot build alexa event from null', () => {
  const event = getEventFromAlexaSkillGateway({ name: 'my-skill-1', event: 'alexa' })({
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
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  expect(event.left).toBeDefined();
});

it.skip('cannot build alexa event from non json', () => {
  const event = getEventFromAlexaSkillGateway({ name: 'my-skill-1', event: 'alexa' })({
    body: 'this is not json',
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
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  expect(event.left).toBeDefined();
});

it.skip('build json from any json', () => {
  const event = getEventFromAlexaSkillGateway({ name: 'my-skill-1', event: 'alexa' })({
    body: 'eyAiaGVsbG8iOiAid29ybGQiIH0=',
    headers: {},
    // multiValueHeaders: {},
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
      payload: { hello: 'world' },
      name: 'alexa',
      source: 'my-skill-1',
    },
  });
});

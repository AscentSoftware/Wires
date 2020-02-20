import * as aws from '@pulumi/aws';

import { fromTask } from './getLogger';

import getAlexaSkillHandler from './getAlexaSkillHandler';
import getInvokeAsyncResource from './resources/getInvokeAsyncResource';
import LambdaConnector from './LambdaConnector';
import getDynamoDbResource from './resources/getDynamoDbResource';
import DynamoDbConnector from './DynamoDbConnector';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const base64 = require('base-64');

it('runs', async () => {
  const log = jest.fn();
  const logger = fromTask(entry => config => (): Promise<boolean> => {
    log(entry, config);
    return Promise.resolve(true);
  });
  const connection = ({
    getInstance() {
      return {
        invokeAsync() {
          return {
            promise() {
              return Promise.resolve('OK');
            },
          };
        },
      };
    },
  } as unknown) as LambdaConnector;

  const lambda = ({
    name: {
      get() {
        return 'test';
      },
    },
  } as unknown) as aws.lambda.Function;

  const dynamodb = ({
    getInstance() {
      return {
        put() {
          return {
            promise() {
              return Promise.resolve({ Attributes: { put: true } });
            },
          };
        },
        get() {
          return {
            promise() {
              return Promise.resolve({ Item: { get: true } });
            },
          };
        },
      };
    },
  } as unknown) as DynamoDbConnector;

  const table = ({
    name: {
      get() {
        return 'test';
      },
    },
    hashKey: {
      get() {
        return 'id';
      },
    },
  } as unknown) as aws.dynamodb.Table;
  const handler = async (_event: any, context: any) => {
    await context.test.put(46)();
    await context.db.upsert({ id: '123', change: { hello: true } })();
    return true;
  };
  const getCallback = getAlexaSkillHandler(handler, { name: 'my-skill', event: 'alexa' });
  const runHandler = getCallback({
    name: 'test',
    resources: {
      test: getInvokeAsyncResource(connection, lambda),
      db: getDynamoDbResource(dynamodb, table),
    },
    getLogger: logger,
    effects: {
      test: {
        put: {},
      },
      db: {
        upsert: {},
      },
    },
    events: {},
    timeout: 1000,
  });
  const result = await runHandler(
    { body: base64.encode('{"hello": "world"}'), headers: {}, isBase64Encoded: true },
    { test: 'a' } as any,
    {} as any,
  );
  expect(result).toStrictEqual({
    statusCode: 200,
    body: 'true',
  });
});

it('runs and log a timeout warning if close to timeout', async () => {
  const log = jest.fn();
  const logger = fromTask(entry => () => (): Promise<boolean> => {
    log(entry);
    return Promise.resolve(true);
  });

  const handler = () =>
    new Promise(resolve =>
      setTimeout(() => {
        resolve(true);
      }, 3000),
    );
  const getCallback = getAlexaSkillHandler(handler, { name: 'my-skill', event: 'alexa' });
  const runHandler = getCallback({
    name: 'test',
    resources: {},
    getLogger: logger,
    effects: {},
    events: {},
    timeout: 10000,
    environment: {
      enabledLevel: 0,
    },
  });
  // return something always
  const result = await runHandler(
    { body: base64.encode('{"hello": "world"}'), headers: {}, isBase64Encoded: true },
    {
      getRemainingTimeInMillis() {
        return 11;
      },
    } as any,
    {} as any,
  );
  expect(result).toStrictEqual({
    statusCode: 200,
    body: 'true',
  });
  // check if timeout warning has been sent
  expect(log).toBeCalledWith({
    data: {},
    message: 'Lambda could have timed out',
    level: 2,
    context: undefined,
  });
});

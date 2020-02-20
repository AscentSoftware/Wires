import * as aws from '@pulumi/aws';

import getInvokeAsyncResource from './getInvokeAsyncResource';
import { fromTask } from '../getLogger';
import { LambdaRuntimeContext } from '../getLambdaHandler';
import LambdaConnector from '../LambdaConnector';
import getEffectHandler from '../effects/getEffectHandler';

it('buils and runs async resource', async () => {
  const log = jest.fn();
  const logger = fromTask(entry => config => (): Promise<boolean> => {
    log(entry, config);
    return Promise.resolve(true);
  });
  const config: LambdaRuntimeContext = {
    logger: logger({} as any),
    correlationIds: {},
    context: {} as any,
    environment: {} as any,
    config: {} as any,
  };

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

  const resource = getInvokeAsyncResource(connection, lambda)(config);

  expect(Object.keys(resource)).toStrictEqual(['put']);

  const result = await resource.put(46)();

  expect(result).toStrictEqual({
    _tag: 'Right',
    right: {
      statusCode: 201,
      body: '"OK"',
    },
  });
});

it('calls an async invoke', async () => {
  const chaos = { minDelay: 0, maxDelay: 1000, probability: 1, isEnabled: false };
  const log = jest.fn();
  const logger = fromTask(entry => config => (): Promise<boolean> => {
    log(entry, config);
    return Promise.resolve(true);
  });
  const config: LambdaRuntimeContext = {
    logger: logger({} as any),
    correlationIds: {},
    context: {} as any,
    environment: {} as any,
    config: {} as any,
  };

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

  const resource = getInvokeAsyncResource(connection, lambda)(config);

  const runHandler = getEffectHandler(
    'resource0',
    'action',
    resource.put,
  )({
    config: {
      name: 'lambda0',
      timeout: 10000,
      effects: {
        resource0: {
          action: { chaos },
        },
      },
    },
    environment: {
      isChaosEnabled: false,
    },
    logger: {
      debug: (...data: any[]) => () => {
        log(data);
        return;
      },
    },
  } as any);
  const result = await runHandler('a')();
  expect(result).toStrictEqual({
    _tag: 'Right',
    right: {
      body: '"OK"',
      statusCode: 201,
    },
  });
  expect(log.mock.calls).toEqual([
    [['Lambda lambda0 calls resource resource0.action', 'a']],
    [
      [
        'Lambda lambda0 gets response from resource resource0',
        {
          body: '"OK"',
          statusCode: 201,
        },
      ],
    ],
  ]);
});

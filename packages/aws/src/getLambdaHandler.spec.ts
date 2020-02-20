import * as E from 'fp-ts/lib/Either';
import * as T from 'fp-ts/lib/Task';

import getLambdaHandler from './getLambdaHandler';
import { fromTask } from './getLogger';
import getLocalResource from './resources/getLocalResource';

it('builds and executes a request', async () => {
  const handler = jest.fn().mockReturnValue(Promise.resolve(true));
  const getCorrelationIds = jest.fn().mockReturnValue({
    test1: 'test1',
    test2: true,
    // let's enable this in order to force logging
    enabledDebugLevel: true,
  });
  const log = jest.fn();
  let flushedLogs = 0;
  const logger = fromTask(entry => config => (): Promise<boolean> => {
    log(entry, config);
    return Promise.resolve(true).finally(() => flushedLogs++);
  });
  const runRequest = getLambdaHandler(
    (request: any) =>
      E.right({
        payload: request,
        name: 'event',
        source: 'test',
      }),
    getCorrelationIds,
    handler,
    (response: any) => ({
      statusCode: 200,
      body: JSON.stringify(response),
    }),
    jest.fn(),
  )({
    getLogger: logger,
    resources: {},
    name: 'test',
    timeout: 1000,
  });
  const response = await runRequest({ n: 0 }, { lambdaContext: true } as any, {} as any);
  expect(handler).toBeCalledWith(
    { payload: { n: 0 }, name: 'event', source: 'test' },
    {
      logger: expect.objectContaining({
        debug: expect.any(Function),
        error: expect.any(Function),
        info: expect.any(Function),
        warn: expect.any(Function),
      }),
    },
    {
      config: {
        getLogger: logger,
        resources: {},
        name: 'test',
        timeout: 1000,
      },
      context: {
        lambdaContext: true,
      },
      correlationIds: {
        enabledDebugLevel: true,
        test1: 'test1',
        test2: true,
      },
      environment: {
        awsRegion: undefined,
        enabledLevel: 3,
        environment: undefined,
        isCloudWatchEnabled: false,
        isChaosEnabled: false,
      },
      logger: {
        debug: expect.any(Function),
        error: expect.any(Function),
        info: expect.any(Function),
        warn: expect.any(Function),
        log: expect.any(Function),
      },
    },
  );

  expect(log).toBeCalledTimes(2);
  expect(flushedLogs).toBe(2);
  expect(response).toStrictEqual({
    statusCode: 200,
    body: 'true',
  });
});

it('returns an error if event is not valid', async () => {
  const handler = jest.fn().mockReturnValue(Promise.resolve(true));
  const getCorrelationIds = jest.fn().mockReturnValue({
    test1: 'test1',
    test2: true,
    // let's enable this in order to force logging
    enabledDebugLevel: true,
  });
  const log = jest.fn();
  let flushedLogs = 0;
  const logger = fromTask(entry => config => (): Promise<boolean> => {
    log(entry, config);
    return Promise.resolve(true).finally(() => flushedLogs++);
  });
  const runRequest = getLambdaHandler(
    (request: any) =>
      E.left([
        {
          value: request,
          context: {} as any,
          message: 'Oh my!',
        },
      ]),
    getCorrelationIds,
    handler,
    jest.fn(),
    (error: any) => ({
      statusCode: 500,
      body: error.errorCode,
    }),
  )({
    getLogger: logger,
    resources: {},
    name: 'test',
    timeout: 1000,
  });
  const response = await runRequest({ n: 0 }, { lambdaContext: true } as any, {} as any);
  expect(handler).toBeCalledTimes(0);
  expect(getCorrelationIds).toBeCalledWith(
    { n: 0 },
    { lambdaContext: true },
    {
      awsRegion: undefined,
      enabledLevel: 3,
      environment: undefined,
      isCloudWatchEnabled: false,
      isChaosEnabled: false,
    },
  );
  expect(log).toBeCalledTimes(3);
  expect(flushedLogs).toBe(3);
  expect(response).toStrictEqual({
    statusCode: 500,
    body: 'MALFORMED_EVENT',
  });
});

it('returns an error if handler throws an unhandled exception', async () => {
  const handler = jest.fn(() => {
    return new Promise(() => {
      throw Error('BUM');
    });
  });
  const getCorrelationIds = jest.fn().mockReturnValue({
    test1: 'test1',
    test2: true,
    // let's enable this in order to force logging
    enabledDebugLevel: true,
  });
  const log = jest.fn();
  let flushedLogs = 0;
  const logger = fromTask(entry => config => (): Promise<boolean> => {
    log(entry, config);
    return Promise.resolve(true).finally(() => flushedLogs++);
  });
  const runRequest = getLambdaHandler(
    (request: any) =>
      E.right({
        payload: request,
        name: 'event',
        source: 'test',
      }),
    getCorrelationIds,

    handler,
    jest.fn(),
    (error: any) => ({
      statusCode: 500,
      body: error.errorCode,
    }),
  )({
    name: 'test',
    getLogger: logger,
    resources: {},
    timeout: 1000,
  });
  const response = await runRequest({ n: 0 }, { lambdaContext: true } as any, {} as any);
  expect(handler).toBeCalledTimes(1);
  expect(getCorrelationIds).toBeCalledWith(
    { n: 0 },
    { lambdaContext: true },
    {
      awsRegion: undefined,
      enabledLevel: 3,
      environment: undefined,
      isCloudWatchEnabled: false,
      isChaosEnabled: false,
    },
  );
  expect(log).toBeCalledTimes(3);
  expect(flushedLogs).toBe(3);
  expect(response).toStrictEqual({
    statusCode: 500,
    body: 'INTERNAL_ERROR',
  });
});

it('returns an error if handler throws a ReferenceError', async () => {
  const handler = jest.fn(() => {
    console.log('HANDLER');
    return new Promise(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      console.log(a);
    });
  });
  const getCorrelationIds = jest.fn().mockReturnValue({
    test1: 'test1',
    test2: true,
    // let's enable this in order to force logging
    enabledDebugLevel: true,
  });
  const log = jest.fn();
  let flushedLogs = 0;
  const logger = fromTask(entry => config => (): Promise<boolean> => {
    log(entry, config);
    return Promise.resolve(true).finally(() => flushedLogs++);
  });
  const runRequest = getLambdaHandler(
    request =>
      E.right({
        payload: request,
        name: 'event',
        source: 'test',
      }),
    getCorrelationIds,
    handler,
    jest.fn(),
    error => ({
      statusCode: 500,
      body: error.errorCode,
    }),
  )({
    name: 'test',
    getLogger: logger,
    resources: {},
    timeout: 1000,
  });
  const response = await runRequest({ n: 0 }, { lambdaContext: true } as any, {} as any);
  expect(handler).toBeCalledTimes(1);
  expect(getCorrelationIds).toBeCalledWith(
    { n: 0 },
    { lambdaContext: true },
    {
      awsRegion: undefined,
      enabledLevel: 3,
      environment: undefined,
      isCloudWatchEnabled: false,
      isChaosEnabled: false,
    },
  );
  expect(log).toBeCalledTimes(3);
  expect(flushedLogs).toBe(3);
  expect(response).toStrictEqual({
    statusCode: 500,
    body: 'INTERNAL_ERROR',
  });
});

it('can access logger and effects within handler', async () => {
  const getCorrelationIds = jest.fn().mockReturnValue({
    test1: 'test1',
    test2: true,
    // let's enable this in order to force logging
    enabledDebugLevel: true,
  });
  const log = jest.fn();
  const logger = fromTask(entry => config => (): Promise<boolean> => {
    log(entry, config);
    return Promise.resolve(true);
  });
  const doSomething = jest.fn().mockReturnValue(T.of(E.right(true)));
  const runRequest = getLambdaHandler(
    request =>
      E.right({
        payload: request,
        name: 'event',
        source: 'test',
      }),
    getCorrelationIds,
    async (event, context) => {
      context.logger.info('Received event', event)();
      await context.test.doSomething(42)();
      return true;
    },
    response => ({
      statusCode: 200,
      body: JSON.stringify(response),
    }),
    jest.fn(),
  )({
    name: 'test',
    getLogger: logger,
    resources: {
      test: getLocalResource(
        {
          doSomething,
        },
        {},
      ),
    },
    effects: {
      test: {
        doSomething: {},
      },
    },
    events: {},
    timeout: 1000,
  });

  const response = await runRequest({ n: 0 }, { lambdaContext: true } as any, {} as any);
  expect(log).toHaveBeenCalledWith(
    {
      message: 'Received event',
      data: { payload: { n: 0 }, name: 'event', source: 'test' },
      context: undefined,
      level: 1,
    },
    {
      context: {
        awsRegion: undefined,
        awsRequestId: undefined,
        correlationIds: { enabledDebugLevel: true, test1: 'test1', test2: true },
        environment: undefined,
        functionMemorySize: undefined,
        functionName: undefined,
        functionVersion: undefined,
      },
      enabledDebugLevel: true,
      isCloudWatchEnabled: false,
      level: 3,
      prefix: undefined,
    },
  );
  expect(doSomething).toBeCalledWith(
    42,
    {
      logger: {
        debug: expect.any(Function),
        error: expect.any(Function),
        info: expect.any(Function),
        warn: expect.any(Function),
        log: expect.any(Function),
      },
    },
    {
      config: {
        getLogger: expect.any(Function),
        name: 'test',
        resources: {
          test: expect.any(Function),
        },
        timeout: 1000,
        effects: {
          test: {
            doSomething: {},
          },
        },
        events: {},
      },
      context: {
        lambdaContext: true,
      },
      correlationIds: {
        enabledDebugLevel: true,
        test1: 'test1',
        test2: true,
      },
      environment: {
        awsRegion: undefined,
        enabledLevel: 3,
        environment: undefined,
        isCloudWatchEnabled: false,
        isChaosEnabled: false,
      },
      logger: {
        debug: expect.any(Function),
        error: expect.any(Function),
        info: expect.any(Function),
        warn: expect.any(Function),
        log: expect.any(Function),
      },
    },
  );
  expect(response).toStrictEqual({
    statusCode: 200,
    body: 'true',
  });
});

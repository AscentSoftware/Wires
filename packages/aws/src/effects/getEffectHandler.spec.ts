import * as E from 'fp-ts/lib/Either';
import * as T from 'fp-ts/lib/Task';

import getEffectHandler from './getEffectHandler';
import { Logger } from '../getLogger';

it('calls the effect handler', async () => {
  const chaos = { minDelay: 0, maxDelay: 1000, probability: 1, isEnabled: false };
  const runEffect = jest.fn().mockReturnValue(T.of(E.right(true)));
  const log = jest.fn();
  const logger: Logger = {
    debug: (...data: any[]) => () => {
      log(data);
      return;
    },
    error: (...data: any[]) => () => {
      log(data);
      return;
    },
  } as any;
  const runHandler = getEffectHandler(
    'resource0',
    'action',
    runEffect,
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
    logger,
  } as any);
  const result = await runHandler('a')();
  expect(result).toStrictEqual({ _tag: 'Right', right: true });
  expect(runEffect).toBeCalledWith('a');
  expect(log.mock.calls).toEqual([
    [['Lambda lambda0 calls resource resource0.action', 'a']],
    [['Lambda lambda0 gets response from resource resource0', true]],
  ]);
});

it.skip('calls the effect handler, local chaos overridden by global settings', async () => {
  const chaos = { minDelay: 0, maxDelay: 1000, probability: 1, isEnabled: true };
  const runEffect = jest.fn().mockReturnValue(T.of(E.right(true)));
  const log = jest.fn();
  const logger: Logger = {
    debug: (...data: any[]) => () => {
      log(data);
      return;
    },
    error: (...data: any[]) => () => {
      log(data);
      return;
    },
  } as any;
  const runHandler = getEffectHandler(
    'resource0',
    'action',
    runEffect,
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
    logger,
  } as any);
  const result = await runHandler('a')();
  expect(result).toStrictEqual({ _tag: 'Right', right: true });
  expect(runEffect).toBeCalledWith('a');
  expect(log.mock.calls).toEqual([
    [['Lambda lambda0 calls resource resource0.action', 'a']],
    [['Lambda lambda0 gets response from resource resource0', true]],
  ]);
});

it.skip('throws timeout', async () => {
  const chaos = { minDelay: 1000, maxDelay: 1000, probability: 1, isEnabled: true };
  const runEffect = jest.fn().mockReturnValue(T.of(E.right(true)));
  const log = jest.fn();
  const logger: Logger = {
    debug: (...data: any[]) => () => {
      log(data);
      return;
    },
    error: (...data: any[]) => () => {
      log(data);
      return;
    },
  } as any;
  const runHandler = getEffectHandler(
    'resource0',
    'action',
    runEffect,
  )({
    config: {
      name: 'lambda0',
      timeout: 0,
      effects: {
        resource0: {
          action: { chaos },
        },
      },
    },
    environment: {
      isChaosEnabled: true,
    },
    logger,
  } as any);
  const result = await runHandler('a')();
  expect(result).toStrictEqual({
    _tag: 'Left',
    left: {
      errorCode: 'TIMEOUT',
      timeout: 0,
    },
  });
  expect(runEffect).toBeCalledTimes(1);
  expect(log.mock.calls).toEqual([
    [['Lambda lambda0 calls resource resource0.action', 'a']],
    [
      [
        'Lambda lambda0 gets an error from resource resource0',
        {
          errorCode: 'TIMEOUT',
          timeout: 0,
        },
      ],
    ],
  ]);
});

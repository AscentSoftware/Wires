import * as T from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Either';

import getLocalResource from './getLocalResource';
import { fromTask } from '../getLogger';
import { LambdaRuntimeContext } from '../getLambdaHandler';

it('buils and runs local resource', async () => {
  const doSomething = jest.fn().mockReturnValue(T.of(E.right(true)));
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

  const resource = getLocalResource<{ doSomething(n: number): boolean }>(
    {
      doSomething,
    },
    {},
  )(config);

  expect(Object.keys(resource)).toStrictEqual(['doSomething']);

  const result = await resource.doSomething(46)();

  expect(doSomething).toBeCalledWith(
    46,
    {
      logger: {
        debug: expect.any(Function),
        error: expect.any(Function),
        info: expect.any(Function),
        warn: expect.any(Function),
        log: expect.any(Function),
      },
    },
    config,
  );

  expect(result).toStrictEqual({
    _tag: 'Right',
    right: true,
  });
});

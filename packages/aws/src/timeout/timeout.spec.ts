import * as TE from 'fp-ts/lib/TaskEither';
import * as T from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Either';

import { pipe } from 'fp-ts/lib/pipeable';

import timeout from './';

it('throws a timeout error', async () => {
  const runTask = timeout(0, () => pipe(TE.fromEither(E.right('DONE')), T.delay(10)));
  const output = await runTask();
  expect(output).toStrictEqual({ _tag: 'Left', left: { errorCode: 'TIMEOUT', timeout: 0 } });
});

it('does not throw a timeout', async () => {
  const runTask = timeout(10000, () => TE.fromEither(E.right('DONE')));
  const output = await runTask();
  expect(output).toStrictEqual({ _tag: 'Right', right: 'DONE' });
});

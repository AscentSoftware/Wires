// based on https://theburningmonk.com/2019/05/how-to-log-timed-out-lambda-invocations/
// impl follow https://github.com/gcanti/retry-ts
import * as TE from 'fp-ts/lib/TaskEither';
import * as T from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Either';

import { pipe } from 'fp-ts/lib/pipeable';
import { LambdaExecutionError } from '@wires/core';

// from https://stackoverflow.com/a/51876360
function getErrorObject(data: any): any {
  return JSON.parse(JSON.stringify(data, Object.getOwnPropertyNames(data)));
}

// using Promise.race, cancel the callback and it is not executed at the second invocation
// impl timeout as a race condition
// as suggested in https://italonascimento.github.io/applying-a-timeout-to-your-promises/
const startTimeout = <L, A>(time: number): Promise<E.Either<L, A>> =>
  new Promise((_resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(true);
    }, time);
  });

const getTimeoutError: <L>(time: number) => LambdaExecutionError | L = time => ({
  errorCode: 'TIMEOUT',
  timeout: time,
});
const getUnknownError: <L>(data: any) => LambdaExecutionError | L = data => ({ errorCode: 'INTERNAL_ERROR', data });

// 'TaskEither<TimeoutError, Either<L, A>>' is not assignable to type 'TaskEither<TimeoutError | L, A>'.
// I should pass context object with info if timeout should be enabled or not
const timeout = <L, A>(
  time: number,
  getAction: () => TE.TaskEither<L, A>,
): TE.TaskEither<L | LambdaExecutionError, A> => {
  const runAction = getAction();
  return pipe(
    TE.tryCatch(
      () => Promise.race([startTimeout<L, A>(time), runAction()]),
      // here we are catching unhandle exceptions or rejects in the main computation as well
      isTimeout => (isTimeout === true ? getTimeoutError<L>(time) : getUnknownError<L>(getErrorObject(isTimeout))),
    ),
    TE.fold(
      error => T.of(E.left<LambdaExecutionError | L, A>(error)),
      output => T.of(output),
    ),
  );
};

export default timeout;

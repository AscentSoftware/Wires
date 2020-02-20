import * as aws from '@pulumi/aws';

import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';

import LambdaConnector from '../LambdaConnector';

import { Reader } from 'fp-ts/lib/Reader';
import { LambdaRuntimeContext, CorrelationIds } from '../getLambdaHandler';
import { LambdaResource, LambdaExecutionError, Queue } from '@wires/core/src';
import { pipe } from 'fp-ts/lib/pipeable';

// the type "seen" by custom handlers
type Async<T> = LambdaResource<Queue<T>>;

interface AsyncContext {
  debug<A>(msg: string, ctx?: any): (fa: T.Task<A>) => T.Task<A>;
  lambda: string;
  connection: LambdaConnector;
  correlationIds: CorrelationIds;
}

const getInternalError = (data: unknown): LambdaExecutionError => ({
  errorCode: 'INTERNAL_ERROR',
  data,
});

const getPut = <S>({ debug, lambda, connection, correlationIds }: AsyncContext) => (data: S) =>
  pipe(
    // TODO add some check if correct type
    T.of(data),
    debug(`Async Invoke ${lambda}`),
    T.chain(data =>
      TE.tryCatch(
        () =>
          connection
            .getInstance()
            .invokeAsync({
              FunctionName: lambda,
              // InvokeArgs must be a stringified json
              InvokeArgs: JSON.stringify({
                event: data,
                correlationIds,
              }),
            })
            .promise(),
        getInternalError,
      ),
    ),
    TE.map(asyncResponse => ({
      // TODO can it return error responses?
      statusCode: 201,
      body: JSON.stringify(asyncResponse),
    })),
    debug(`Async Invoke ${lambda} Successful`),
  );

const getInvokeAsyncResource = <S>(
  connection: LambdaConnector,
  lambda: aws.lambda.Function,
): Reader<LambdaRuntimeContext, Async<S>> => (config): Async<S> => {
  const { logger, correlationIds } = config;
  const { debug: log } = logger;
  const debug = (message: string, context?: any) => <A>(fa: T.Task<A>) =>
    T.task.map(fa, data => {
      log(message, data, context)();
      return data;
    });
  const put = getPut<S>({ connection, lambda: lambda.name.get(), debug, correlationIds });
  return { put };
};

export default getInvokeAsyncResource;

import * as aws from '@pulumi/aws';

import * as TE from 'fp-ts/lib/TaskEither';
import * as T from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Either';
import * as W from 'fp-ts/lib/Writer';

import { pipe } from 'fp-ts/lib/pipeable';

import { LambdaOptions, LambdaExecutionError, LambdaResource } from '@wires/core';
import { Reader } from 'fp-ts/lib/Reader';

import { LoggerOptions, Level, Logger, getLoggerIO, LoggerIO } from './getLogger';
import getContext from './getContext';
import { Errors, Validation } from 'io-ts';

import { start, end, tapL, chain, tap, branch } from 'tap-ts/lib/TaskEither';

import { getExecutionError as getLogError } from 'tap-ts';

// TODO event and return value must have type unknown
export type LambdaHandler = LambdaOptions<any, any, any, any>['handler'];

// from https://stackoverflow.com/a/51876360
function getErrorObject(data: any): any {
  return JSON.parse(JSON.stringify(data, Object.getOwnPropertyNames(data)));
}

interface Event {
  source: string;
  payload: any;
  name: string;
}

export interface CorrelationIds {
  [k: string]: any;
}

/**
 * info from process.env
 */
export interface LambdaEnvironment {
  enabledLevel: Level;
  isCloudWatchEnabled: boolean;
  awsRegion?: string;
  environment?: string;
  isChaosEnabled: boolean;
}

export type ResourceFactories = {
  [resourceName: string]: Reader<LambdaRuntimeContext, LambdaResource<{ [k: string]: (args: any) => any }>>;
};

/**
 * info from lambda factory
 */
export interface LambdaConfig {
  name: string;
  getLogger: Reader<LoggerOptions, Logger>;
  resources: ResourceFactories;
  effects?: any;
  events?: any;
  timeout: number;
  environment?: Partial<LambdaEnvironment>;
}

export interface Source {
  name: string;
  event: string;
}

/**
 * the context of execution of a lambda
 */
export interface LambdaRuntimeContext {
  /** process.env */
  environment: LambdaEnvironment;
  /** lambda construction options */
  config: LambdaConfig;
  /** aws context */
  context: aws.lambda.Context;
  /** used to identify a computation across multiple lambdas */
  correlationIds: CorrelationIds;
  /** logger to be used in the current execution */
  logger: LoggerIO;
  // TODO currently source is part of an event
  // I think that it would be better to add source to context
  // and leave event as much basic as possible
  /** source that invoked this lambda and event type */
  source?: Source;
}

export type LambdaReader<T, S> = Reader<LambdaConfig, aws.lambda.Callback<T, S>>;

const getMalformedRequestError = (error: Errors): LambdaExecutionError => ({
  errorCode: 'MALFORMED_EVENT',
  data: E.left(error) as Validation<Event>,
});
const getExecutionError = (error: any): LambdaExecutionError => ({
  errorCode: 'INTERNAL_ERROR',
  data: getErrorObject(error),
});

const buildResponse = <S>(onLeft: (error: LambdaExecutionError) => S, onRight: (payload: unknown) => S) => (
  t: TE.TaskEither<LambdaExecutionError, unknown>,
): TE.TaskEither<any, S> => pipe(t, TE.bimap(onLeft, onRight), TE.fold(TE.right, TE.right));

/**
 * Pre-emptively log timeout messages
 *
 * based on https://theburningmonk.com/2019/05/how-to-log-timed-out-lambda-invocations/
 *
 * @param timeout
 * @param getAction
 * @param onTimeout
 */
const listenToTimeout = <T>(timeout: number, getAction: () => T.Task<T>, onTimeout: () => void): T.Task<T> => {
  const handle = setTimeout(() => {
    onTimeout();
  }, timeout);
  return pipe(
    getAction(),
    T.map(a => {
      clearTimeout(handle);
      return a;
    }),
  );
};

const getLambdaHandler = <T, S>(
  getEventFromRequest: (request: T) => E.Either<Errors, Event>,
  getRuntimeContext: (request: T, context: aws.lambda.Context, env: LambdaEnvironment) => CorrelationIds,
  handler: LambdaHandler,
  getResponse: (payload: unknown) => S,
  getErrorResponse: (error: LambdaExecutionError) => S,
): LambdaReader<T, S> => config => {
  return (request, context): Promise<S> => {
    const { name: lambdaName, resources, getLogger } = config;

    // prepare local lambda environment
    // check if env var are prepared and set
    // common to every lambda
    const environment: LambdaEnvironment = {
      enabledLevel: process.env.ENABLED_LEVEL
        ? parseInt(process.env.ENABLED_LEVEL) !== NaN
          ? parseInt(process.env.ENABLED_LEVEL)
          : Level.ERROR
        : Level.ERROR,
      isCloudWatchEnabled: !!process.env.ENABLE_CLOUDWATCH,
      awsRegion: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION,
      environment: process.env.ENVIRONMENT || process.env.STAGE,
      isChaosEnabled: !!process.env.ENABLE_CHAOS && process.env.ENABLE_CHAOS === 'true',
      // override defaults
      ...config.environment,
    };

    // TODO I should change name
    // correlationIDs are variables dependent on the lambda kind
    // used to identify a process across multiple lambdas
    const correlationIds = getRuntimeContext(request, context, environment);

    // create new loggers
    const logger = getLogger({
      prefix: context.functionName,
      isCloudWatchEnabled: environment.isCloudWatchEnabled,
      enabledDebugLevel: correlationIds.enabledDebugLevel,
      level: environment.enabledLevel,
      context: {
        awsRequestId: context.awsRequestId,
        awsRegion: environment.awsRegion,
        functionName: context.functionName,
        functionVersion: context.functionVersion,
        functionMemorySize: context.memoryLimitInMB,
        environment: environment.environment,
        correlationIds,
      },
    });

    const timeout = context.getRemainingTimeInMillis ? parseInt(context.getRemainingTimeInMillis()) - 10 : 6000;

    // TODO I should report ANY error, otherwise we know that we have an error respone
    // but not what error
    const runRequest = listenToTimeout(
      timeout,
      () =>
        pipe(
          start<LambdaExecutionError, T>(request),
          tap(data => logger.log({ data, level: Level.DEBUG, message: `Started lambda ${lambdaName}` })),
          chain(request => pipe(TE.fromEither(getEventFromRequest(request)), TE.mapLeft(getMalformedRequestError))),
          branch(wa => {
            const w = W.execWriter(wa);
            // create a more familiar LoggerIO for custom handlers
            // in this way logging for users is just a sync computation
            // under the hood we take care of awaits
            // TODO it is a bit hacky: a cleaner way is if custom handlers return an observable task
            // in this way we can simply merge the result of a handler execution with the main writer
            const loggerIO: LoggerIO = getLoggerIO(a => (): void => {
              // exec logTask
              const runLogTask = TE.tryCatch(() => logger.log(a)(), getLogError);
              // collect promises
              const result = runLogTask();
              // attach promises to the rest of the computation
              w.push(result);
              return;
            });
            const runtime: LambdaRuntimeContext = {
              config,
              context,
              correlationIds,
              environment,
              logger: loggerIO,
            };
            return pipe(
              wa,
              chain(event => {
                return TE.tryCatch<LambdaExecutionError, unknown>(() => {
                  return handler(event, getContext(resources, runtime), runtime);
                }, getExecutionError);
              }),
            );
          }),
          tapL(data => logger.log({ data, level: Level.ERROR, message: `Error while processing ${lambdaName}` })),
          W.map(buildResponse(getErrorResponse, getResponse)),
          tap(data => logger.log({ data, level: Level.DEBUG, message: `Ended lambda ${lambdaName}` })),
          end(),
          TE.getOrElse(error => T.of(getErrorResponse(error))),
        ),
      async () => {
        const runLog = logger.log({ level: Level.WARN, data: {}, message: 'Lambda could have timed out' });
        // we must await, otherwise log is not flushed
        await runLog();
      },
    );

    return runRequest();
  };
};

export default getLambdaHandler;

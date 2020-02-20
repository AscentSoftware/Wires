import * as TE from 'fp-ts/lib/TaskEither';

import { pipe } from 'fp-ts/lib/pipeable';
import injectLatency, { InjectLatencyContext } from '../chaos/injectLatency';

import timeout from '../timeout';
import { Reader, ask, map, chain, asks } from 'fp-ts/lib/Reader';
import { LambdaRuntimeContext } from '../getLambdaHandler';
import { LambdaExecutionError } from '@wires/core';

export interface Effect {
  (param: any): TE.TaskEither<LambdaExecutionError, any>;
}

export interface EffectRuntimeContext {
  logger: LambdaRuntimeContext['logger'];
  lambdaName: string;
  timeout: number;
  chaos: InjectLatencyContext;
}

const DEFAULT_CHAOS = { minDelay: 0, maxDelay: 0, probability: 0, isEnabled: false };

/**
 * read local chaos settings for an effect from lambda spec
 */
const getLocalChaos = (resource: string, action: string, context: LambdaRuntimeContext['config']): any => {
  if (context.effects && context.effects[resource] && context.effects[resource][action]) {
    const config = context.effects[resource][action];
    return {
      ...DEFAULT_CHAOS,
      ...(config.chaos || {}),
    };
  }
  return DEFAULT_CHAOS;
};

// override local chaos with global settings
const overrideChaosConfig: (
  local: InjectLatencyContext,
) => Reader<LambdaRuntimeContext, EffectRuntimeContext> = local =>
  pipe(
    ask<LambdaRuntimeContext>(),
    map(config => ({
      logger: config.logger,
      lambdaName: config.config.name,
      // TODO override default with local configs
      timeout: config.config.timeout,
      // disable chaos if not enabled globally
      chaos: config.environment.isChaosEnabled ? local : DEFAULT_CHAOS,
    })),
  );

/**
 * Compute a runtime context for an effect from the lambda runtime
 */
const getEffectRuntimeContext: (
  action: string,
  resource: string,
) => Reader<LambdaRuntimeContext, EffectRuntimeContext> = (
  action: string,
  resource: string,
): Reader<LambdaRuntimeContext, EffectRuntimeContext> =>
  pipe(
    ask<LambdaRuntimeContext>(),
    chain(config => overrideChaosConfig(getLocalChaos(resource, action, config.config))),
  );

// TODO it should handle only timout and chaos, plus other wrappers
// the rest of the logic is part of getContext
const getEffectHandler = (
  resource: string,
  action: string,
  runEffect: Effect,
): Reader<LambdaRuntimeContext, Effect> => {
  return pipe(
    asks(getEffectRuntimeContext(action, resource)),
    map(({ logger, lambdaName, timeout: time, chaos }) => {
      const { debug, error } = logger;
      return (param: unknown): TE.TaskEither<LambdaExecutionError, any> => {
        return pipe(
          TE.right(param),
          TE.map(param => {
            debug(`Lambda ${lambdaName} calls resource ${resource}.${action}`, param)();
            return param;
          }),
          // TODO wrap runEffect in try-catch
          TE.chain(param => timeout(time, () => pipe(runEffect(param), injectLatency(chaos)))),
          TE.map(result => {
            debug(`Lambda ${lambdaName} gets response from resource ${resource}`, result)();
            return result;
          }),
          TE.mapLeft(originalError => {
            error(`Lambda ${lambdaName} gets an error from resource ${resource}`, originalError)();
            return originalError;
          }),
        );
      };
    }),
  );
};

export default getEffectHandler;

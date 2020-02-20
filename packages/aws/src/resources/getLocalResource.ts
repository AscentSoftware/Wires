import * as T from 'fp-ts/lib/Task';

import { Reader } from 'fp-ts/lib/Reader';
import { LambdaRuntimeContext } from '../getLambdaHandler';
import { SpecWithContext, ResourceSpec, LambdaResource } from '@wires/core/src/createResource';
import { pipe } from 'fp-ts/lib/pipeable';
import getContext from '../getContext';

// this is the type "seen" in the custom handler
type LocalResource<T extends ResourceSpec> = LambdaResource<T>;

const getLocalResource = <S extends ResourceSpec>(
  spec: SpecWithContext<S, any>,
  resources: any,
): Reader<LambdaRuntimeContext, LocalResource<S>> => (config): LocalResource<S> => {
  const { debug: log } = config.logger;
  const debug = (message: string, context?: any) => <A>(fa: T.Task<A>) =>
    T.task.map(fa, data => {
      log(message, data, context)();
      return data;
    });
  const resource: LocalResource<S> = {} as any;
  Object.keys(spec).forEach((fnName: keyof SpecWithContext<S, any>) => {
    resource[fnName] = param =>
      pipe(
        T.of(param),
        debug(`Function call ${fnName}`), // which resource?
        T.chain(param => {
          const ret = spec[fnName](param, getContext(resources, config), config);
          return ret;
        }),
        // TOFIX here it logs a TaskEither
        debug(`Function call ${fnName} returns a result`),
      );
  });
  return resource;
};

export default getLocalResource;

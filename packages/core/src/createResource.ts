import * as TE from 'fp-ts/lib/TaskEither';

import { Network } from './Network';
import { Resource } from './Resource';
import { LambdaExecutionError } from '.';
import { LambdaContext } from './Resources';

export interface CustomResource {
  kind: 'resource';
  spec: SpecWithContext<any, ResourceContext<any>>;
  network: Network<any, any, any, any>;
}

export interface ResourceSpec {
  [k: string]: (args: any) => any;
}

export type LambdaResource<T extends ResourceSpec> = {
  [k in keyof T]: (args: Parameters<T[k]>[0]) => TE.TaskEither<LambdaExecutionError, ReturnType<T[k]>>;
};

export type SpecWithContext<T extends ResourceSpec, C> = {
  [k in keyof T]: (
    args: Parameters<T[k]>[0],
    context: LambdaContext<C>,
    // info about the running context
    // including info about the particular provider (e.g. AWS)
    runtime: unknown,
  ) => TE.TaskEither<LambdaExecutionError, ReturnType<T[k]>>;
};

export type ResourceContext<N extends Network<any, any, any, any>> = {
  [k in keyof N['resources']]: {
    [m in keyof N['resources'][k]['spec']]: (
      data: Parameters<N['resources'][k]['spec'][m]>[0],
    ) => TE.TaskEither<LambdaExecutionError, ReturnType<N['resources'][k]['spec'][m]>>;
  };
};

const emptyNetwork: any = { resources: {}, lambdas: {}, links: {}, names: [] };

const createResource = <N extends string, T extends ResourceSpec, S extends Network<any, any, any, any> = never>(
  name: N,
  spec: SpecWithContext<T, ResourceContext<S>>,
  network: S = emptyNetwork,
): Network<{}, Resource<N, T>, {}, {}> => {
  return {
    resources: ({
      [name]: { kind: 'resource', spec, network },
    } as unknown) as Resource<N, T>, // TODO fix
    lambdas: {},
    links: {},
    names: [],
  };
};

export default createResource;

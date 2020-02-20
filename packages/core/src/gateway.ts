import { Network } from './Network';
import { Resource } from './Resource';
import { ResourceEvent } from './Resources';

interface HttpRequest {
  method: 'get' | 'post';
  path: string;
}

export interface GatewaySpec<N, E extends ResourceEvent> {
  name: N;
  events: {
    [k in E['name']]: HttpRequest;
  };
}

export interface GatewayResource {
  kind: 'http-gateway';
  spec: GatewaySpec<any, any>;
}

const gateway = <N extends string, E extends ResourceEvent>(
  spec: GatewaySpec<N, E>,
): Network<{}, Resource<N, never, E>, {}, {}> => {
  return {
    resources: {
      [spec.name]: { kind: 'http-gateway', spec: spec as any },
    } as Resource<N, never, E>,
    lambdas: {},
    links: {},
    names: [],
  };
};

export default gateway;

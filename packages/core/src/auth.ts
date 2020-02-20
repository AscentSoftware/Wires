import { Network } from './Network';
import { Resource } from './Resource';
import { Auth } from './Resources';

const auth = <N extends string, C, T>(options: { name: string }): Network<{}, Resource<N, Auth<C, T>>, {}, {}> => ({
  resources: {
    [options.name]: { kind: 'auth', spec: options as any },
  } as Resource<N, Auth<C, T>>,
  lambdas: {},
  links: {},
  names: [],
});

export default auth;

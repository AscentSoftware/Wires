import { LambdaOptions, Lambda, Sync, Event } from './Resources';
import { Network, Names } from './Network';
import { Link } from './Link';
import { Resource } from './Resource';

/**
 *
 */
const api = <N extends string, X extends Event<any, any, any>, Y, E>({
  name,
  handler,
  effects,
}: LambdaOptions<N, X, Y, E>): Network<
  Lambda<N, X, Y, E>,
  Resource<N, Sync<X, Y>>,
  Link<N, keyof E, never>,
  Names<keyof E>
> => {
  return {
    resources: {
      [name]: { kind: 'api', spec: {} as any },
    } as Resource<N, Sync<X, Y>>,
    lambdas: {
      [name]: { name, handler },
    } as Lambda<N, X, Y, E>,
    links: {
      [name]: effects,
    } as Link<N, keyof E, never>,
    names: Object.keys(effects) as Names<keyof E>,
  };
};

export default api;

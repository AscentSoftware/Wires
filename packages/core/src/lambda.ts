import { LambdaOptions, Lambda, Event, Sources, Payloads } from './Resources';
import { Network, Names } from './Network';
import { Link } from './Link';

const lambda = <N extends string, X extends Event<any, any, any>, Y, E>({
  name,
  handler,
  effects,
  events,
}: LambdaOptions<N, X, Y, E>): Network<
  Lambda<N, Payloads<X>, Y, E>,
  {},
  Link<N, keyof E, Sources<X>>,
  Names<keyof E | Sources<X>>
> => {
  return {
    resources: {},
    lambdas: {
      [name]: { name, handler },
    } as Lambda<N, Payloads<X>, Y, E>,
    links: {
      [name]: {
        effects,
        events,
      },
    } as Link<N, keyof E, Sources<X>>,
    names: [...Object.keys(effects), ...Object.keys(events)] as Names<keyof E | Sources<X>>,
  };
};

export default lambda;

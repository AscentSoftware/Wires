import { Network } from './Network';
import { Queue } from './Resources';
import { Resource } from './Resource';

export interface QueueResource {
  kind: 'queue';
  spec: any;
}

/**
 *
 * A queue represents an async communication channel.
 * The actual mechanism should be chosen depending on network and provider constraints.
 * For example, if there is only one receiver, in AWS, a simple async invocation should be ok, otherwise SQN or EventBridge
 *
 * @see https://docs.aws.amazon.com/lambda/latest/dg/invocation-async.html
 *
 * @param spec
 */
const queue = <N extends string, T, U>(spec: any): Network<{}, Resource<N, Queue<T>, U>, {}, {}> => {
  return {
    resources: ({
      [spec.name]: { kind: 'queue', spec: spec as any },
    } as unknown) as Resource<N, Queue<T>>,
    lambdas: {},
    links: {},
    names: [],
  };
};

export default queue;

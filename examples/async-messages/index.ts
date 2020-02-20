import { build } from '@wires/aws';

import { queueNetwork } from './src/async-messages';

const stack = build(queueNetwork);

// export stack
export const helloLambdaArn = stack.lambdas.sender.arn;

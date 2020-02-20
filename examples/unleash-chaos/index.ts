import { build } from '@wires/aws';

import { chaosNetwork } from './src/hello';

const stack = build(chaosNetwork);

// export stack
export const chaosLambdaArn = stack.lambdas.chaos.arn;

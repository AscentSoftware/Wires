import { build } from '@wires/aws';

import { helloNetwork } from './src/hello';

const stack = build(helloNetwork);

// export stack
export const helloLambdaArn = stack.lambdas['say-hello'].arn;

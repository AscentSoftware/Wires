import { build } from '@wires/aws';

import scenario from './src/index';

const stack = build(scenario);

// export stack
export const entrypointLambdaArn = stack.lambdas['my-skill-entrypoint'].arn;

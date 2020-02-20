import { build } from '@wires/aws';

import scenario from './examples/alexa-deferred-with-sync-api/src/index';

const stack = build(scenario);

// export stack
export const entrypointLambdaArn = stack.lambdas.entrypoint.arn;

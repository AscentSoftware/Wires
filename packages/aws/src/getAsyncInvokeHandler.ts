import * as aws from '@pulumi/aws';

import getLambdaHandler, { LambdaHandler, LambdaReader, LambdaEnvironment } from './getLambdaHandler';
import { Level } from './getLogger';

import { AsyncInvokationEvent, getEventFromAsyncInvoke } from './codecs/AsyncInvokationEvent';
import { identity } from 'io-ts';

export interface ApiGatewaySource {
  name: string;
  event: string;
}

const getAsyncInvokeContext = (
  request: AsyncInvokationEvent,
  _context: aws.lambda.Context,
  env: LambdaEnvironment,
): any => {
  return {
    ...request.correlationIds,
    // force debug if it has been enabled in prev step
    enabledDebugLevel: request.correlationIds.enableNextDebugLevel,
    // next step must enable debug is debug is enabled in this step
    enableNextDebugLevel: request.correlationIds.enableNextDebugLevel || env.enabledLevel === Level.DEBUG,
  };
};

const getAsyncInvokeHandler = (
  runHandler: LambdaHandler,
  source: ApiGatewaySource,
): LambdaReader<AsyncInvokationEvent, unknown> =>
  getLambdaHandler<AsyncInvokationEvent, unknown>(
    getEventFromAsyncInvoke(source),
    getAsyncInvokeContext,
    runHandler,
    identity,
    identity,
  );

export default getAsyncInvokeHandler;

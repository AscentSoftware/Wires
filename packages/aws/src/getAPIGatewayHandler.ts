import * as aws from '@pulumi/aws';

import getLambdaHandler, { LambdaHandler, LambdaEnvironment, LambdaReader } from './getLambdaHandler';
import { Level } from './getLogger';

import { PathReporter } from 'io-ts/lib/PathReporter';

import { APIGatewayProxyEvent, getEventFromGateway } from './codecs/APIGatewayProxyEvent';
import { APIGatewayProxyResult } from './codecs/APIGatewayProxyResult';
import { LambdaExecutionError } from '@wires/core';

export interface ApiGatewaySource {
  name: string;
  event: string;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const uuid = require('uuid/v1');

const getGatewayContext = (request: APIGatewayProxyEvent, context: aws.lambda.Context, env: LambdaEnvironment): any => {
  // gateway is an entrypoint, so we create new correlationIds
  return {
    id: uuid(),
    userAgent: request.headers && request.headers['User-Agent'],
    awsRequestId: context.awsRequestId,
    entrypoint: context.functionName,
    timestamp: new Date().toISOString(),
    // no previous step, so it is disabled
    enabledDebugLevel: false,
    // next step must enable debug is debug is enabled in this step
    enableNextDebugLevel: env.enabledLevel === Level.DEBUG,
  };
};

const getGatewayResponse = (payload: unknown): APIGatewayProxyResult => {
  return {
    statusCode: 200,
    body: JSON.stringify(payload),
  };
};

const getGatewayErrorResponse = (error: LambdaExecutionError): APIGatewayProxyResult => {
  switch (error.errorCode) {
    case 'MALFORMED_EVENT':
      const report = PathReporter.report(error.data);
      return {
        statusCode: 404,
        body: JSON.stringify(report),
      };
    case 'INTERNAL_ERROR':
    case 'INVALID_RESULT':
    // TODO validate output of handler
    // e.g. let's be sure that it is a valid alexa response
    default:
      return {
        statusCode: 500,
        body: 'Internal Error',
      };
  }
};

const getAPIGatewayHandler = (
  runHandler: LambdaHandler,
  source: ApiGatewaySource,
): LambdaReader<APIGatewayProxyEvent, APIGatewayProxyResult> =>
  getLambdaHandler<APIGatewayProxyEvent, APIGatewayProxyResult>(
    getEventFromGateway(source),
    getGatewayContext,
    runHandler,
    getGatewayResponse,
    getGatewayErrorResponse,
  );

export default getAPIGatewayHandler;

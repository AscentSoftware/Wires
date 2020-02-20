import * as aws from '@pulumi/aws';

import { APIGatewayProxyResult } from 'aws-lambda';
import getLambdaHandler, { LambdaHandler, LambdaEnvironment, LambdaReader } from './getLambdaHandler';
import { Level } from './getLogger';

import { APIGatewayProxyEvent } from './codecs/APIGatewayProxyEvent';
import { getEventFromAlexaSkillGateway } from './codecs/AlexaSkillGateway';

import { PathReporter } from 'io-ts/lib/PathReporter';
import { LambdaExecutionError } from '@wires/core';

export interface ApiGatewaySource {
  name: string;
  event: string;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const uuid = require('uuid/v1');

// TODO types are wrong, requests should be Event

const getAlexaSkillContext = (
  _request: APIGatewayProxyEvent,
  context: aws.lambda.Context,
  env: LambdaEnvironment,
): any => {
  // gateway is an entrypoint, so we create new correlationIds
  return {
    id: uuid(),
    awsRequestId: context.awsRequestId,
    entrypoint: context.functionName,
    timestamp: new Date().toISOString(),
    // no previous step, so it is disabled
    enabledDebugLevel: false,
    // next step must enable debug is debug is enabled in this step
    enableNextDebugLevel: env.enabledLevel === Level.DEBUG,
  };
};

const getErrorResponse = (error: LambdaExecutionError): APIGatewayProxyResult => {
  switch (error.errorCode) {
    case 'MALFORMED_EVENT':
      const report = PathReporter.report(error.data);
      return {
        statusCode: 200,
        body: JSON.stringify(report),
      };
    case 'INTERNAL_ERROR':
    case 'INVALID_RESULT':
    // TODO validate output of handler
    // e.g. let's be sure that it is a valid alexa response
    default:
      return {
        statusCode: 200,
        body: JSON.stringify(error),
      };
  }
};

const getResponse = (payload: unknown): APIGatewayProxyResult => ({
  statusCode: 200,
  body: JSON.stringify(payload),
});

const getAlexaSkillHandler = (
  runHandler: LambdaHandler,
  source: ApiGatewaySource,
): LambdaReader<APIGatewayProxyEvent, APIGatewayProxyResult> =>
  getLambdaHandler<APIGatewayProxyEvent, APIGatewayProxyResult>(
    getEventFromAlexaSkillGateway(source),
    getAlexaSkillContext,
    runHandler,
    getResponse,
    getErrorResponse,
  );

export default getAlexaSkillHandler;

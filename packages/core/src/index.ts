// export types
export * from './Link';
export * from './Network';
export * from './Resource';
export * from './Resources';

// export constructors
export { default as lambda } from './lambda';
export { default as database, DatabaseResource } from './database';
export { default as queue, QueueResource } from './queue';
export { default as gateway, GatewayResource } from './gateway';
export { default as createResource, CustomResource } from './createResource';
export { default as auth } from './auth';
export { default as compose } from './compose';
export { default as lambdaSync } from './lambdaSync';

export interface MalformedEventError<A = any> {
  errorCode: 'MALFORMED_EVENT';
  data: A;
}

export interface InternalError {
  errorCode: 'INTERNAL_ERROR';
  data: any;
}

export interface ResultValidationError {
  errorCode: 'INVALID_RESULT';
  data: any;
}

export interface TimeoutError {
  errorCode: 'TIMEOUT';
  timeout: number;
  data?: any;
}

export type LambdaExecutionError = MalformedEventError | InternalError | ResultValidationError | TimeoutError;

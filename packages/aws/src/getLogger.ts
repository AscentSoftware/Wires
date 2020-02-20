import * as L from 'logging-ts/lib/IO';
import * as T from 'fp-ts/lib/Task';
import * as IO from 'fp-ts/lib/IO';

import { Reader } from 'fp-ts/lib/Reader';

import { Task } from 'fp-ts/lib/Task';

import { allPass } from 'fp-ts-ramda';
import { constant } from 'fp-ts/lib/function';

import { LoggerTask, filter, getMonoid } from './LoggerTask';

export enum Level {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface AWSContext {
  awsRequestId: string;
  awsRegion?: string;
  functionName: string;
  functionVersion: string;
  functionMemorySize: string;
  environment?: string;
  correlationIds?: any;
}

export interface Entry<T = any> {
  data: T;
  message: string;
  level: Level;
  context?: any;
}

export interface LoggerOptions {
  prefix: string; // e.g. lambda name
  level: Level;
  isCloudWatchEnabled: boolean;
  enabledDebugLevel: boolean;
  context: AWSContext;
}

export interface Logger {
  log(entry: Entry): Task<void>;
  debug(message: string, data: any, context?: any): Task<void>;
  info(message: string, data: any, context?: any): Task<void>;
  warn(message: string, data: any, context?: any): Task<void>;
  error(message: string, data: any, context?: any): Task<void>;
}

export interface LoggerIO {
  log(entry: Entry): IO.IO<void>;
  debug(message: string, data: any, context?: any): IO.IO<void>;
  info(message: string, data: any, context?: any): IO.IO<void>;
  warn(message: string, data: any, context?: any): IO.IO<void>;
  error(message: string, data: any, context?: any): IO.IO<void>;
}

export const showDebugLevel = (level: Level): string => {
  switch (level) {
    case Level.DEBUG:
      return 'debug';
    case Level.ERROR:
      return 'error';
    case Level.INFO:
      return 'info';
    case Level.WARN:
      return 'warning';
    default:
      return 'unknown';
  }
};

function getCloudWatchEntry(config: LoggerOptions): LoggerTask<Entry> {
  return (entry): T.Task<void> => {
    console.log(
      `[${config.context.functionName}][${showDebugLevel(entry.level)}] ${entry.message}:\n
        data=${JSON.stringify(entry.data, null, 2)}\n
        context=${JSON.stringify({ ...config.context, ...entry.context }, null, 2)}\n
        enabledDebugLevel=${config.enabledDebugLevel}`,
    );
    return T.of(undefined);
  };
}

const isEnabled = (config: LoggerOptions) => (entry: Entry): boolean =>
  config.enabledDebugLevel || entry.level >= config.level;

const cloudWatchLogger = (config: LoggerOptions): LoggerTask<Entry> =>
  filter(getCloudWatchEntry(config), allPass([isEnabled(config), constant(config.isCloudWatchEnabled)]));

export type LogTask = (entry: Entry) => Reader<LoggerOptions, Task<any>>;

export const fromTask: (getRunTask: LogTask) => Reader<LoggerOptions, Logger> = getRunTask => (config): Logger => {
  const logger = getMonoid<Entry>().concat(
    cloudWatchLogger(config),
    filter(entry => getRunTask(entry)(config), isEnabled(config)),
  );

  // TODO use contramap
  return {
    log: logger,
    debug: (message, data, context): Task<void> => logger({ message, data, context, level: Level.DEBUG }),
    error: (message, data, context): Task<void> => logger({ message, data, context, level: Level.ERROR }),
    info: (message, data, context): Task<void> => logger({ message, data, context, level: Level.INFO }),
    warn: (message, data, context): Task<void> => logger({ message, data, context, level: Level.WARN }),
  };
};

export const getLoggerIO = (logger: L.LoggerIO<Entry>): LoggerIO => {
  // TODO use contramap
  return {
    log: logger,
    debug: (message, data, context): IO.IO<void> => logger({ message, data, context, level: Level.DEBUG }),
    error: (message, data, context): IO.IO<void> => logger({ message, data, context, level: Level.ERROR }),
    info: (message, data, context): IO.IO<void> => logger({ message, data, context, level: Level.INFO }),
    warn: (message, data, context): IO.IO<void> => logger({ message, data, context, level: Level.WARN }),
  };
};

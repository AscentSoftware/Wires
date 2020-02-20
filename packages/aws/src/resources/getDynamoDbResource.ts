import * as T from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Either';
import * as TE from 'fp-ts/lib/TaskEither';

import DynamoDbConnector from '../DynamoDbConnector';
import * as aws from '@pulumi/aws';

import { Reader } from 'fp-ts/lib/Reader';
import { LambdaRuntimeContext } from '../getLambdaHandler';
import { Database, LambdaResource, LambdaExecutionError } from '@wires/core';
import { pipe } from 'fp-ts/lib/pipeable';

// the type "seen" by custom handlers
type DB<S> = LambdaResource<Database<S>>;

export type DynamoDbResource<S> = (
  connection: DynamoDbConnector,
  table: aws.dynamodb.Table,
) => Reader<LambdaRuntimeContext, DB<S>>;

interface DynamoDBContext {
  debug<A>(msg: string, ctx?: any): (fa: T.Task<A>) => T.Task<A>;
  table: string;
  primaryKey: string;
  connection: DynamoDbConnector;
}

const getInternalError = (data: unknown): LambdaExecutionError => ({
  errorCode: 'INTERNAL_ERROR',
  data,
});

const getRead = <S>({ debug, table, primaryKey, connection }: DynamoDBContext) => (itemId: string) =>
  pipe(
    T.of({
      TableName: table,
      Key: { [primaryKey]: itemId },
    }),
    debug(`DynamoDB ${table} get query`),
    T.chain(params =>
      TE.tryCatch(
        () =>
          connection
            .getInstance()
            .get(params)
            .promise(),
        getInternalError,
      ),
    ),
    // TODO add some check to verify if Item has the expected shape and is defined
    TE.map(tableData => tableData.Item as S),
    debug(`DynamoDB ${table} get query result`),
  );

const getPut = <S>({ debug, table, primaryKey, connection }: DynamoDBContext) => (itemId: string, change: any) =>
  pipe(
    T.of({
      TableName: table,
      Item: {
        [primaryKey]: itemId,
        // TODO just override fields, do some checks
        ...change,
      },
    }),
    debug(`DynamoDB ${table} put query`),
    T.chain(params =>
      TE.tryCatch(
        () =>
          connection
            .getInstance()
            .put(params)
            .promise(),
        getInternalError,
      ),
    ),
    // TODO add some check to verify if Item has the expected shape and is defined
    TE.map(tableData => tableData.Attributes as S),
    debug(`DynamoDB ${table} put query result`),
  );

const getUnsupported = () => T.of(E.left(getInternalError('Unsupported')));

// TODO validate inputs and output
const getDynamoDbResource = <S>(
  connection: DynamoDbConnector,
  table: aws.dynamodb.Table,
): Reader<LambdaRuntimeContext, DB<S>> => (config): DB<S> => {
  const { debug: log } = config.logger;
  const debug = (message: string, context?: any) => <A>(fa: T.Task<A>) =>
    T.task.map(fa, data => {
      log(message, data, context)();
      return data;
    });
  const read = getRead<S>({ connection, primaryKey: table.hashKey.get(), debug, table: table.name.get() });
  const put = getPut<S>({ connection, primaryKey: table.hashKey.get(), debug, table: table.name.get() });
  return {
    read,
    upsert: ({ id: itemId, change }) =>
      pipe(
        read(itemId),
        TE.chain(_item => put(itemId, change)),
      ),
    // TODO check if exists
    update: ({ id: itemId, change }) => put(itemId, change),
    create: getUnsupported,
    delete: getUnsupported,
    query: getUnsupported,
  };
};

export default getDynamoDbResource;

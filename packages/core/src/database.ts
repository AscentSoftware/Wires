import { Network } from './Network';
import { Database, Schema } from './Resources';
import { Resource } from './Resource';

export interface DatabaseResource {
  kind: 'database';
  name: string;
  spec: Schema<any, any>;
}

const database = <N extends string, S>(schema: Schema<N, S>): Network<{}, Resource<N, Database<S>>, {}, {}> => {
  return {
    resources: {
      [schema.name]: { kind: 'database', name: schema.name, spec: schema as any }, // shape is not that from Database
    } as Resource<N, Database<S>>,
    lambdas: {},
    links: {},
    names: [],
  };
};

export default database;

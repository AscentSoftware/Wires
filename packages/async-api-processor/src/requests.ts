import { database, Resource, Network, Database } from '@wires/core';
import { ApiRequest } from './processor';

const requestsDb: Network<{}, Resource<'requests', Database<ApiRequest>>, {}, {}> = database<'requests', ApiRequest>({
  name: 'requests',
  attributes: [
    {
      name: 'requestId',
      type: 'S',
    },
    // TODO add other fields
  ],
  pk: 'requestId',
});

export default requestsDb;

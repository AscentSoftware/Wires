import { database, Resource, Network, Database } from '@wires/core';

const registryDb: Network<{}, Resource<'register', Database<any>>, {}, {}> = database<'register', any>({
  name: 'register',
  attributes: [
    {
      name: 'userId',
      type: 'S',
    },
    {
      name: 'code',
      type: 'S',
    },
  ],
  pk: 'userId',
});

export default registryDb;

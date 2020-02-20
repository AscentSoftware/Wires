import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';

import { database, Network, Resource } from '@wires/core';

import createResource, { ResourceSpec } from '@wires/core/lib/createResource';

export interface Request {
  url: string;
  method: string;
  body: string;
}

export interface Response {
  body: string;
  statusCode: number;
}

export interface Device {
  id: string;
  on: boolean;
}

export interface Api extends ResourceSpec {
  fetch(req: Request): Response;
}

// keep bulb state in dynamodb
// typically, we do not implement API, from our point of view they are just an external resource

const subnetwork = database<'devices', Device>({
  name: 'devices',
  attributes: [
    {
      name: 'id',
      type: 'S',
    },
    {
      name: 'on',
      type: 'B',
    },
  ],
  pk: 'id',
});

const api: Network<{}, Resource<'api', Api>, {}, {}> = createResource(
  'api',
  {
    fetch(request, context) {
      context.logger.info('Processing API request', request)();
      // this is not a lambda, but a plain function
      // in a real use case, here I implement the http logic
      // TODO validate data
      const item = JSON.parse(request.body);
      // TODO assume http://example.com/devices/{deviceId}
      const itemId = request.url.substring(request.url.lastIndexOf('/') + 1);
      const runTask = pipe(
        context.devices.upsert({ id: itemId, change: item }),
        TE.map(() => ({
          statusCode: 201,
          body: 'DONE',
        })),
      );
      return runTask;
    },
  },
  subnetwork,
);

export interface CanUpdateOrInsert {
  devices: {
    upsert(deviceId: string, change: Partial<Device>): Device;
  };
}

export default api;

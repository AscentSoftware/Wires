import * as E from 'fp-ts/lib/Either';
import * as T from 'fp-ts/lib/Task';

import { Network, Resource } from '@wires/core';

import createResource, { ResourceSpec } from '@wires/core/lib/createResource';

export interface AcceptedResponse {
  statusCode: number;
  body: string;
}

interface User {
  id: string;
  name: string;
  surname: string;
}

export interface AuthService extends ResourceSpec {
  getUserFromToken(token: string): User | null;
}

// TODO let's hardcode values here
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
const users: Network<{}, Resource<'users', AuthService>, {}, {}> = createResource('users', {
  getUserFromToken(token: string, _context) {
    if (token === '123') {
      return T.of(
        E.right({
          id: '1',
          name: 'John',
          surname: 'Doe',
        }),
      );
    }
    return T.of(E.right(null));
  },
});

export default users;

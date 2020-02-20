import { compose, HttpPost } from '@wires/core';

import gateway from '@wires/core/lib/gateway';

import network from './network';
import users from './users';
import api from './api';

const hookGateway = gateway<'hook', HttpPost>({
  name: 'hook',
  events: {
    'http-post': {
      method: 'post',
      path: '/',
    },
  },
});

// connect network with
// 1. auth service users
// 2. 3rd party api
// r. hook gateway
const scenario = compose(network, compose(hookGateway, compose(users, api)));

export default scenario;

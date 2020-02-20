import { compose } from '@wires/core';

import network from './network';
import users from './users';
import api from './api';

// connect network with
// 1. auth service users
// 2. 3rd party api
const scenario = compose(network, compose(users, api));

export default scenario;

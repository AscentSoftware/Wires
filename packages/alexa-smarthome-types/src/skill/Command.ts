import { Payloads } from '../base/Payloads';
import { Endpoint } from './Endpoint';

/**
 * A `Command` is not part of Alexa dictionary, but sometimes it is useful to refer to
 * the executable part of a directive without extra information.
 */
export interface Command<D extends keyof Payloads> {
  name: D;
  endpoint: Endpoint;
  payload: Payloads[D];
}

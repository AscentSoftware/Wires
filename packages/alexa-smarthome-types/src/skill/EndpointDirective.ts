import { Directives } from '../base/Directives';
import { Payloads } from '../base/Payloads';
import { Endpoint } from '../skill/Endpoint';
import { Header } from '../skill/Header';

export interface EndpointDirective<NS extends keyof Directives, D extends keyof Directives[NS]> {
  directive: {
    header: Header<NS, D>;
    endpoint: Endpoint;
    // @ts-ignore
    payload: Payloads[D];
  };
}

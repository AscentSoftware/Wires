import { Capabilities } from '../base/Capabilities';
import { Header } from '../skill/Header';
import { DiscoveryEndpoint } from './DiscoverEndpoint';

export interface DiscoverEvent<C extends keyof Capabilities> {
  event:{
    header: Header<'Alexa.Discovery', 'Discover.Response'>;
    payload: {
      endpoints:  Array<DiscoveryEndpoint<C>>;
    }
  }
}

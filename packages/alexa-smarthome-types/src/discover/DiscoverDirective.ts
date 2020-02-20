import { Directive } from '../skill/Directive';
import { BearerTokenScope } from '../skill/Endpoint';
import { Header } from '../skill/Header';

export interface DiscoveryDirective extends Directive {
  header: Header<'Alexa.Discovery', 'Discovery'>;
  payload: {
    scope: BearerTokenScope;
  }
}

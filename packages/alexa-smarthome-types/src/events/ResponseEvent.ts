import { Capabilities } from '../base/Capabilities';
import { Event } from '../skill/Event';
import { Header } from '../skill/Header';
import { Property } from '../skill/Property';

/**
 * @see https://developer.amazon.com/docs/device-apis/alexa-interface.html#response
 */

type ExpectedProperty<C extends keyof Capabilities> = {
  [NS in C]: Property<NS>
}[C];

export interface ResponseEvent<C extends keyof Capabilities> extends Event {
  context: {
    properties: Array<ExpectedProperty<C>>;
  }
  event: {
    header: Header<'Alexa', 'Response'>;
    endpoint: {
      // TODO async have scope here
      endpointId: string;
    };
    payload: {};
  }
}

import { Event } from '../skill/Event';
import { Header } from '../skill/Header';

/**
 * @see https://developer.amazon.com/docs/device-apis/alexa-interface.html#deferredresponse
 */

export interface DeferredEvent extends Event {
  event: {
    header: Header<'Alexa', 'DeferredResponse'>;
    payload: {
      estimatedDeferralInSeconds?: number;
    };
  }
}

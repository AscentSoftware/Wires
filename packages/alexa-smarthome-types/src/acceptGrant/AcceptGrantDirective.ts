import { Directive } from '../skill/Directive';
import { Header } from '../skill/Header';

export interface AcceptGrantDirective extends Directive {
  header: Header<'Alexa.Authorization', 'AcceptGrant'>;
  payload: {
    grant: {
      type: 'OAuth2.AuthorizationCode',
      code: string;
    },
    grantee: {
      type: 'BearerToken',
      token: string;
    }
  }
}

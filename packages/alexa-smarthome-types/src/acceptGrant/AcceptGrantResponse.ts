import { Header } from '../skill/Header';

export interface AcceptGrantResponse {
  event:{
    header: Header<'Alexa.Authorization', 'AcceptGrant.Response'>;
    payload: {}
  }
}

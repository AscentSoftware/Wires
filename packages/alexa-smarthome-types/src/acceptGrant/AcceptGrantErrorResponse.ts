import { Header } from '../skill/Header';

export interface AcceptGrantErrorResponse {
  event:{
    header: Header<'Alexa.Authorization', 'ErrorResponse'>;
    payload: {
      type: 'ACCEPT_GRANT_FAILED',
      message: string;
    }
  }
}

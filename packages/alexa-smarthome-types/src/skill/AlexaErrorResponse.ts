import { AcceptGrantErrorResponse } from '../acceptGrant/AcceptGrantErrorResponse';
import { ErrorResponse } from '../events/ErrorResponse';

export type AlexaErrorResponse = ErrorResponse | AcceptGrantErrorResponse;

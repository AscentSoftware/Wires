import { Event } from '../skill/Event';
import { Header } from '../skill/Header';

export type ErrorType =
  | 'ALREADY_IN_OPERATION'
  | 'BRIDGE_UNREACHABLE'
  | 'ENDPOINT_BUSY'
  | 'ENDPOINT_LOW_POWER'
  | 'ENDPOINT_UNREACHABLE'
  | 'EXPIRED_AUTHORIZATION_CREDENTIAL'
  | 'FIRMWARE_OUT_OF_DATE'
  | 'HARDWARE_MALFUNCTION'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'INTERNAL_ERROR'
  | 'INVALID_AUTHORIZATION_CREDENTIAL'
  | 'INVALID_DIRECTIVE'
  | 'INVALID_VALUE'
  | 'NO_SUCH_ENDPOINT'
  | 'NOT_CALIBRATED'
  | 'NOT_SUPPORTED_IN_CURRENT_MODE'
  | 'NOT_IN_OPERATION'
  | 'POWER_LEVEL_NOT_SUPPORTED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'TEMPERATURE_VALUE_OUT_OF_RANGE'
  | 'VALUE_OUT_OF_RANGE'
  | string;

export interface ErrorPayload {
  type?: ErrorType;
  message?: string;
}

/**
 * @see https://developer.amazon.com/docs/device-apis/alexa-errorresponse.html
 */

export interface ErrorResponse extends Event {
  event: {
    header: Header<'Alexa', 'ErrorResponse'>;
    payload: ErrorPayload;
  }
}

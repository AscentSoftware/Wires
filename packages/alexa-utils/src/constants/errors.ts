// Credentials have expired.
export const EXPIRED_AUTHORIZATION_CREDENTIAL =
  'EXPIRED_AUTHORIZATION_CREDENTIAL';

// General failure to authenticate.
export const INVALID_AUTHORIZATION_CREDENTIAL =
  'INVALID_AUTHORIZATION_CREDENTIAL';

// Indicates a directive is not valid for this skill or is malformed.
export const INVALID_DIRECTIVE = 'INVALID_DIRECTIVE';

// The target is unreachable.
export const ENDPOINT_UNREACHABLE = 'ENDPOINT_UNREACHABLE';

// The range in parameters is out of bounds.
export const VALUE_OUT_OF_RANGE = 'VALUE_OUT_OF_RANGE';

// Indicates the target endpoint does not exist or no longer exists.
export const NO_SUCH_ENDPOINT = 'NO_SUCH_ENDPOINT';

// The command or its parameters are unsupported (this should generally not happen,
// as traits and business logic should prevent it).
export const NOT_SUPPORTED_IN_CURRENT_MODE = 'NOT_SUPPORTED_IN_CURRENT_MODE';

// The temperature range in parameters is out of bounds.
export const TEMPERATURE_VALUE_OUT_OF_RANGE = 'TEMPERATURE_VALUE_OUT_OF_RANGE';

// Indicates the target bridge enpoint is out of range. For exmample, the hub might be disconnected.
export const BRIDGE_UNREACHABLE = 'BRIDGE_UNREACHABLE';

// Everything else, although anything that throws this should be replaced with a real error code.
export const INTERNAL_ERROR = 'INTERNAL_ERROR';

// The thermostat mode in parameters is not valid or unsupported.
export const UNSUPPORTED_THERMOSTAT_MODE = 'UNSUPPORTED_THERMOSTAT_MODE';

// Accept Grant fails or is not supported
export const ACCEPT_GRANT_FAILED = 'ACCEPT_GRANT_FAILED';

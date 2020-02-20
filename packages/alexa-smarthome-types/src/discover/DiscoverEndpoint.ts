import { Capabilities } from '../base/Capabilities';
import { Capability } from '../skill/Capability';
import { Endpoint } from '../skill/Endpoint';

/**
 * @see https://developer.amazon.com/docs/device-apis/alexa-discovery.html#display-categories
 */
export type DisplayCategory =
    'ACTIVITY_TRIGGER'
  | 'CAMERA'
  | 'CONTACT_SENSOR'
  | 'DOOR'
  | 'DOORBELL'
  | 'LIGHT'
  | 'MICROWAVE'
  | 'MOTION_SENSOR'
  | 'OTHER'
  | 'SCENE_TRIGGER'
  | 'SECURITY_PANEL'
  | 'SMARTLOCK'
  | 'SMARTPLUG'
  | 'SPEAKER'
  | 'SWITCH'
  | 'TEMPERATURE_SENSOR'
  | 'THERMOSTAT'
  | 'TV';

type ExpectedCapability<C extends keyof Capabilities> = {
  [NS in C]: Capability<NS>
}[C];

export interface DiscoveryEndpoint<C extends keyof Capabilities> extends Endpoint {
  endpointId: string;
  manufacturerName: string;
  description: string;
  friendlyName: string;
  displayCategories: DisplayCategory[];
  capabilities: Array<ExpectedCapability<C>>;
}

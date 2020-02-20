import { Capabilities } from '../base/Capabilities';
import { Properties } from '../base/Properties';

export interface SupportedProperty<N extends keyof Capabilities> {
  name: keyof Properties[N];
}

export interface Props<N extends keyof Capabilities> {
  supported?: Array<SupportedProperty<N>>;
  proactivelyReported?: boolean;
  retrievable?: boolean;
}

export interface Capability<N extends keyof Capabilities = keyof Capabilities> {
  type: 'AlexaInterface';
  interface: N;
  version: '3';
  properties?: Props<N>;
}

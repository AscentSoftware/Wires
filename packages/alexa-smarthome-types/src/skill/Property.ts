import { Properties } from '../base/Properties';

export interface Property<NS extends keyof Properties, Props = Properties[NS]> {
  namespace: NS;
  name: keyof Props;
  timeOfSample: string;
  uncertaintyInMilliseconds: number;
  value: Props[keyof Props];
}

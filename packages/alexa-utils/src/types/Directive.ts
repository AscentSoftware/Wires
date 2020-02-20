import { AdjustBrightnessDirective } from './AdjustBrightnessDirective';
import { DiscoveryDirective } from './DiscoveryDirective';
import { ReportStateDirective } from './ReportStateDirective';
import { SetBrightnessDirective } from './SetBrightnessDirective';
import { SetColorDirective } from './SetColorDirective';
import { TurnOffDirective } from './TurnOffDirective';
import { TurnOnDirective } from './TurnOnDirective';
import { AcceptGrantDirective } from './AcceptGrantDirective';

export type Directive =
  | AcceptGrantDirective
  | DiscoveryDirective
  | TurnOnDirective
  | TurnOffDirective
  | SetBrightnessDirective
  | SetColorDirective
  | AdjustBrightnessDirective
  | ReportStateDirective;

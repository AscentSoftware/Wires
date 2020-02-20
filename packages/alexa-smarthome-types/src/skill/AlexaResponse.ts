import { AcceptGrantResponse } from '../acceptGrant/AcceptGrantResponse';
import { DiscoverEvent } from '../discover/DiscoverEvent';
import { DeferredEvent } from '../events/DeferredEvent';
import { ResponseEvent } from '../events/ResponseEvent';
import { StateReportEvent } from '../events/StateReportEvent';

export type AlexaResponse = DeferredEvent | ResponseEvent<any> | StateReportEvent<any> | DiscoverEvent<any> | AcceptGrantResponse;

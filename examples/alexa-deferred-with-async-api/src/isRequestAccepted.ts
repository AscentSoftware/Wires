import { HttpResponse } from 'async-api-processor/lib/processor';
import { EndpointDirective } from 'alexa-smarthome-ts/src';

const isRequestAccepted: (req: HttpResponse, directive: EndpointDirective<any, any>) => boolean = () => true;

export default isRequestAccepted;

import { compose, Network, Link, Lambda, Names, Database, Resource } from '@wires/core';
import { EndpointDirective, ResponseEvent, AlexaErrorResponse } from 'alexa-smarthome-ts/src';

import processor, {
  HttpRequest,
  HttpResponse,
  AcceptedResponse,
  HttpCall,
  CanCreateRequest,
  ApiRequest,
} from './processor';
import apiChangeHandler, { SendAlexaGateway, CanReadRequest } from './apiChangeHandler';
import requestsDb from './requests';

const network: (
  toHttp: (requestId: string, directive: EndpointDirective<any, any>) => HttpRequest | null,
  fromHttp: (
    req: HttpRequest,
    directive: EndpointDirective<any, any>,
  ) => ResponseEvent<any> | AlexaErrorResponse | null,
  isRequestAccepted: (req: HttpResponse, directive: EndpointDirective<any, any>) => boolean,
  getRequestId: (req: HttpRequest) => string,
) => Network<
  Lambda<'async-processor', EndpointDirective<any, any>, AcceptedResponse, HttpCall & CanCreateRequest> &
    Lambda<'api-change-handler', EndpointDirective<any, any>, AcceptedResponse, SendAlexaGateway & CanReadRequest>,
  Resource<'requests', Database<ApiRequest>>,
  Link<'async-processor', 'api' | 'requests', 'defer'> & Link<'api-change-handler', 'dispatch' | 'requests', 'hook'>,
  Names<'api' | 'hook' | 'dispatch' | 'defer'>
> = (toHttp, fromHttp, isRequestAccepted, getRequestId) =>
  compose(compose(processor(toHttp, isRequestAccepted), apiChangeHandler(getRequestId, fromHttp)), requestsDb);

export default network;

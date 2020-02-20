import { HttpRequest } from 'async-api-processor/lib/processor';

const getRequestId: (httpRequest: HttpRequest) => string = httpRequest => {
  const request = JSON.parse(httpRequest.body);
  return request.requestId;
};

export default getRequestId;

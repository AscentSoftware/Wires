import * as t from 'io-ts';
import * as E from 'fp-ts/lib/Either';

import { pipe } from 'fp-ts/lib/pipeable';
import { Event } from '@wires/core';

export const AsyncInvokationEventCodec = t.type({
  event: t.UnknownRecord,
  correlationIds: t.UnknownRecord,
});

export type AsyncInvokationEvent = t.TypeOf<typeof AsyncInvokationEventCodec>;

const getEvent: (s: any) => t.Encode<AsyncInvokationEvent, Event<any, any, any>> = source => request => {
  const { event } = request;
  return {
    payload: event,
    source: source.name,
    name: source.event,
  };
};

export const getEventFromAsyncInvoke = (source: any) => (request: unknown) =>
  pipe(AsyncInvokationEventCodec.decode(request), E.map(getEvent(source)));

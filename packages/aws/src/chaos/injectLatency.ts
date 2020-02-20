import * as T from 'fp-ts/lib/Task';
import { Reader } from 'fp-ts/lib/Reader';
import { identity } from 'fp-ts/lib/function';

// we should have a data type for chaos
// composable with other chaos like logger
// with possiblity to add an actual logger to report when chaos is injected
// TODO create a external service for chaos with logging capabilities

// we can have different kinds of chaos
// consider only latency
export interface InjectLatencyContext {
  isEnabled: boolean;
  probability: number;
  minDelay: number;
  maxDelay: number;
}

const isEnabled: Reader<InjectLatencyContext, boolean> = context => {
  return context.isEnabled === true && Math.random() < context.probability;
};

// I could use State monad
const getDelay: Reader<InjectLatencyContext, number> = context => {
  const delayRange = context.maxDelay - context.minDelay;
  const delay = Math.floor(context.minDelay + Math.random() * delayRange);
  console.log(`>>> CHAOS: latency ${delay} <<<`);
  return delay;
};

const injectLatency = (config: InjectLatencyContext) =>
  isEnabled(config) ? T.delay(getDelay(config)) : T.map(identity);

export default injectLatency;

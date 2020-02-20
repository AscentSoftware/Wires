import getEffectHandler from './effects/getEffectHandler';
import { LambdaRuntimeContext, ResourceFactories } from './getLambdaHandler';
import { LambdaContext } from '@wires/core';

const getContext = (resources: ResourceFactories, runtime: LambdaRuntimeContext): LambdaContext<any> => {
  const context: any = {};

  Object.keys(resources).forEach(resourceName => {
    context[resourceName] = {};
    const getResource = resources[resourceName];
    const resource = getResource(runtime);
    Object.keys(resource).forEach(effectName => {
      const runHandler = resource[effectName];
      const getEffectHandlerForContext = getEffectHandler(resourceName, effectName, runHandler);
      context[resourceName][effectName] = getEffectHandlerForContext(runtime);
    });
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  context['logger'] = runtime.logger;

  return context as LambdaContext<any>;
};

export default getContext;

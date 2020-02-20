import pick from 'ramda/src/pick';
import { Reader } from 'fp-ts/lib/Reader';
import { LambdaRuntimeContext } from './getLambdaHandler';
import { LambdaResource } from '@wires/core';

class Resources {
  private resources: any = {};

  addResource(name: string, resource: Reader<LambdaRuntimeContext, LambdaResource<any>>) {
    this.resources[name] = resource;
  }

  getResources(names: string[]) {
    return pick(names, this.resources);
  }
}

export default Resources;

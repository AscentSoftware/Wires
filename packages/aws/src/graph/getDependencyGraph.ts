import { Network, LambdaContext, DatabaseResource, QueueResource, GatewayResource, CustomResource } from '@wires/core';
import { AlexaHomeSkillResource } from 'alexa-resources';
import { Graph, Node, Edge } from './Graph';

export interface LambdaNode {
  kind: 'lambda';
  name: string;
  handler: (event: any, context: LambdaContext<any>, runtime: unknown) => Promise<any>;
}
export interface ResourceNode {
  kind: 'resource';
  name: string;
  resource: DatabaseResource | QueueResource | GatewayResource | CustomResource | AlexaHomeSkillResource;
}

export type ServerlessNode = LambdaNode | ResourceNode;

// TODO there could be unused resources, I could return a report
export const getDependencyGraph = (network: Network<any, any, any, {}>): Graph<ServerlessNode> => {
  const nodes: Node<ServerlessNode>[] = [];
  const edges: Edge[] = [];

  let index = 0;

  Object.keys(network.lambdas).forEach(lambdaName => {
    const node = {
      index: index,
      payload: {
        ...network.lambdas[lambdaName],
        name: lambdaName,
        kind: 'lambda',
      },
    };
    nodes.push(node);
    index = index + 1;
  });

  Object.keys(network.resources).forEach(resourceName => {
    const resource = network.resources[resourceName];
    const node: Node<ResourceNode> = {
      index: index,
      payload: {
        resource: network.resources[resourceName],
        name: resourceName,
        kind: 'resource',
      },
    };
    const lambdaId = index;
    index = index + 1;
    // create dependencies for subnetworks
    // TODO can it be done recurively?
    // TOFIX we are considering networks with only resources/effects
    if (resource.network) {
      Object.keys(resource.network.resources).forEach(resourceName => {
        const subresource = resource.network.resources[resourceName];
        const subnode: Node<ResourceNode> = {
          index: index,
          payload: {
            resource: subresource,
            name: resourceName,
            kind: 'resource',
          },
        };
        index = index + 1;
        nodes.push(subnode);
        edges.push([subnode.index, lambdaId]);
      });
    }

    nodes.push(node);
  });

  Object.keys(network.links).forEach(lambdaName => {
    const link = network.links[lambdaName];
    const lambda = nodes.find(node => node.payload.kind === 'lambda' && node.payload.name === lambdaName);
    if (lambda) {
      const lambdaId = lambda.index;
      Object.keys(link.effects).forEach(effectName => {
        const resource = nodes.find(node => node.payload.kind === 'resource' && node.payload.name === effectName);
        if (resource) {
          edges.push([resource.index, lambdaId]);
        }
      });
      Object.keys(link.events).forEach(resourceName => {
        const resource = nodes.find(node => node.payload.kind === 'resource' && node.payload.name === resourceName);
        if (resource) {
          edges.push([lambdaId, resource.index]);
        }
      });
    }
    // TODO what to do if lambda does not exist?
    // in theory at this point we should have check that the network is well formed
    // same for effects and events
  });

  return [nodes, edges];
};

export default getDependencyGraph;

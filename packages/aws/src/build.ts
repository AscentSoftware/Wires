import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';

import { Network } from '@wires/core';

import { isNone } from 'fp-ts/lib/Option';

// connectors to AWS resources
import DynamoDbConnector from './DynamoDbConnector';
import LambdaConnector from './LambdaConnector';
import ElasticsearchConnector from './ElasticsearchConnector';

// resources
import Resources from './Resources';

// resource factories
import getDynamoDbResource from './resources/getDynamoDbResource';
import getInvokeAsyncResource from './resources/getInvokeAsyncResource';

// lambda handler factories
import getAPIGatewayHandler from './getAPIGatewayHandler';
import getAlexaSkillHandler from './getAlexaSkillHandler';
import getAsyncInvokeHandler from './getAsyncInvokeHandler';

// logging
import { fromTask } from './getLogger';
import getElasticsearchLogger from './getElasticsearchLogger';
import getLocalResource from './resources/getLocalResource';

// dfs topological order
import dfs from './dfs';
import { LambdaConfig, LambdaHandler } from './getLambdaHandler';
import getDependencyGraph, { ServerlessNode } from './graph/getDependencyGraph';

export interface AWSNetwork {
  lambdas: {
    [k: string]: aws.lambda.Function;
  };
  dynamodb: {
    [k: string]: aws.dynamodb.Table;
  };
  gateways: {
    [k: string]: awsx.apigateway.API;
  };
}

export const build = (network: Network<any, any, any, {}>): AWSNetwork => {
  const graph = getDependencyGraph(network);

  const getConnectedLambda = (spec: any) => {
    const connectedLambdas = Object.entries(network.links).filter(
      ([_lambdaName, { events }]: any) =>
        events[spec.name] !== undefined /* && events[spec.name]['alexa'] !== undefined */,
    );
    if (connectedLambdas.length === 0) {
      return null; // gateways are not necessarily connected (or are they?)
    }
    if (connectedLambdas.length > 1) {
      // TODO in a more advanced impl I can simulate this using an intermediate lambda
      console.log(
        `Only one lambda can be connected to ${spec.name}. Fetching the first one: ${connectedLambdas[0][0]}`,
      );
    }
    const [lambdaName]: any = connectedLambdas[0];
    return lambdaName;
  };

  const connector = new DynamoDbConnector();
  const lambdaConnector = new LambdaConnector();

  const output: AWSNetwork = {
    lambdas: {},
    dynamodb: {},
    gateways: {},
  };

  // TODO find a name for the network
  // TODO create proper policies, write access for all network lambdas
  const es = new aws.elasticsearch.Domain('wires-logger', {
    clusterConfig: {
      instanceType: 't2.small.elasticsearch',
    },
    elasticsearchVersion: '7.1',
    ebsOptions: {
      ebsEnabled: true,
      volumeSize: 10,
      volumeType: 'gp2',
    },
  });

  // TODO generate logger name somehow
  // TODO externalize logger, ideally we want to pass it in build
  const sendToElasticsearch = getElasticsearchLogger('wires', new ElasticsearchConnector(es));
  const getLogger = fromTask(sendToElasticsearch);

  const sorted = dfs(graph);

  if (isNone(sorted)) {
    console.log('Cannot build network: cyclic dependency!');
    return output;
  }

  // TODO add a check if unused resources

  // keep track of built resources
  const resources = new Resources();
  const lambdaConfigs: { [name: string]: [LambdaHandler, LambdaConfig] } = {};

  for (let i = 0; i < sorted.value.length; i++) {
    const node: ServerlessNode = sorted.value[i].payload;

    switch (node.kind) {
      case 'lambda':
        const lambdaName = node.name;
        const handler = node.handler;

        const effects = network.links[lambdaName].effects;
        const lambdaResources = resources.getResources(Object.keys(effects));

        lambdaConfigs[lambdaName] = [
          handler,
          {
            name: lambdaName,
            resources: lambdaResources,
            getLogger,
            effects: network.links[lambdaName].effects,
            events: network.links[lambdaName].events,
            timeout: 10000,
          },
        ];
        break;
      case 'resource':
        const resource = node.resource;
        switch (resource.kind) {
          case 'database':
            const table = new aws.dynamodb.Table(resource.spec.name, {
              // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
              // @ts-ignore
              attributes: resource.spec.attributes.filter(attr => attr.name === resource.spec.pk),
              hashKey: resource.spec.pk,
              // some reasonable defaults
              readCapacity: 1,
              writeCapacity: 1,
            });
            output.dynamodb[resource.spec.name] = table;
            resources.addResource(resource.spec.name, getDynamoDbResource(connector, table));
            break;
          case 'resource':
            const resourceSpec = resource.spec;
            const name = node.name;
            const subnetwork = resource.network;
            const lambdaResources = resources.getResources(Object.keys(subnetwork.resources));
            resources.addResource(name, getLocalResource(resourceSpec, lambdaResources));
            break;
          case 'queue':
            // TODO refactor: code is common with other "cases", find a more functional way
            const lambdaNameQ = getConnectedLambda(resource.spec);
            const [handlerQ, lambdaConfigQ] = lambdaConfigs[lambdaNameQ];

            const getCallbackQ = getAsyncInvokeHandler(handlerQ, { name: resource.spec.name, event: 'event' });

            const lambda = new aws.lambda.CallbackFunction(`${resource.spec.name}-${lambdaNameQ}`, {
              callback: getCallbackQ(lambdaConfigQ),
              environment: {
                variables: {
                  // TODO add config param to lambda
                  ENABLED_LEVEL: '0',
                  ENABLE_CLOUDWATCH: 'true',
                  ENABLE_CHAOS: 'false',
                },
              },
            });

            output.lambdas[`${resource.spec.name}-${lambdaNameQ}`] = lambda;

            resources.addResource(resource.spec.name, getInvokeAsyncResource(lambdaConnector, lambda));
            break;
          case 'alexa-home-skill':
            const lambdaName = getConnectedLambda(resource.spec);
            const [handler, lambdaConfig] = lambdaConfigs[lambdaName];

            const getCallback = getAlexaSkillHandler(handler, { name: resource.spec.name, event: 'alexa' });

            const alexaSkillLambda = new aws.lambda.CallbackFunction(`${resource.spec.name}-${lambdaName}`, {
              callback: getCallback(lambdaConfig),
              environment: {
                variables: {
                  // TODO add config param to lambda
                  ENABLED_LEVEL: '0',
                  ENABLE_CLOUDWATCH: 'true',
                  ENABLE_CHAOS: 'false',
                },
              },
            });

            output.lambdas[`${node.name}-${lambdaName}`] = alexaSkillLambda;
            // TODO we should create an Alexa Home Skill, for now let's use a gateway
            const alexaGateway = new awsx.apigateway.API(node.name, {
              routes: [
                {
                  path: '/smarthome',
                  method: 'POST',
                  eventHandler: alexaSkillLambda,
                },
              ],
              stageName: 'dev',
            });
            output.gateways[node.name] = alexaGateway;
            break;
          case 'http-gateway':
            const routes = Object.entries(resource.spec.events)
              .map(([eventName, config]: any) => {
                const lambdaName = getConnectedLambda(resource.spec);
                const [handler, lambdaConfig] = lambdaConfigs[lambdaName];
                const getCallback = getAPIGatewayHandler(handler, { name: node.name, event: eventName });
                const lambda = new aws.lambda.CallbackFunction(`${node.name}-${lambdaName}`, {
                  callback: getCallback(lambdaConfig),
                  environment: {
                    variables: {
                      // TODO add config param to lambda
                      ENABLED_LEVEL: '0',
                      ENABLE_CLOUDWATCH: 'true',
                      // env variable to control chaos
                      ENABLE_CHAOS: 'false',
                      // TODO for each resource/action
                    },
                  },
                });
                output.lambdas[`${node.name}-${lambdaName}`] = lambda;
                return {
                  path: config.path,
                  method: config.method.toUpperCase(),
                  eventHandler: lambda,
                };
              }) // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
              // @ts-ignore
              .filter<{ path: any; method: any; eventHandler: any }>(route => route !== null);
            const gateway = new awsx.apigateway.API(node.name, {
              routes,
              stageName: 'dev',
            });
            output.gateways[node.name] = gateway;
            break;
          default:
            console.log('type not found');
        }
    }
  }

  return output;
};

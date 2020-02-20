import ElasticsearchConnector from './ElasticsearchConnector';

import { showDebugLevel } from './getLogger';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const uuid = require('uuid/v1');

// I want to wait for a response to be sure that logs are flushed
import { LogTask } from './getLogger';

// the log service should inject log fast
// is ES suitable for this task? KInesis maybe is better
const getElasticsearchLogger: (domain: string, connection: ElasticsearchConnector) => LogTask = (
  domain: string,
  connection: ElasticsearchConnector,
) => entry => config => (): Promise<any> =>
  connection.getInstance().index({
    index: domain,
    type: 'log',
    id: uuid(),
    body: {
      level: showDebugLevel(entry.level),
      message: entry.message,
      data: entry.data,
      context: { level: config.level, ...config.context, ...entry.context },
      timestamp: new Date().toISOString(),
    },
  });

export default getElasticsearchLogger;

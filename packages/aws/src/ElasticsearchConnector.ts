import { Client as ESClient } from '@elastic/elasticsearch';
import { Domain } from '@pulumi/aws/elasticsearch';

class ElasticsearchConnector {
  private instance: ESClient | undefined;
  constructor(private resource: Domain) {}
  getInstance(): ESClient {
    if (!this.instance) {
      this.instance = new ESClient({
        node: 'https://' + this.resource.endpoint.get(),
      });
    }
    return this.instance;
  }
}

export default ElasticsearchConnector;

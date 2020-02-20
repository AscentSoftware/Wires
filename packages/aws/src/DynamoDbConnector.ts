import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as aws from '@pulumi/aws';

class DynamoDbConnector {
  private instance: DocumentClient | undefined;

  getInstance(): DocumentClient {
    if (!this.instance) {
      this.instance = new aws.sdk.DynamoDB.DocumentClient();
    }
    return this.instance;
  }
}

export default DynamoDbConnector;

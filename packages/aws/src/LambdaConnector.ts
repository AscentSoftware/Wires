import Lambda from 'aws-sdk/clients/lambda';

class LambdaConnector {
  private instance: Lambda | undefined;
  getInstance(): Lambda {
    if (!this.instance) {
      this.instance = new Lambda();
    }
    return this.instance;
  }
}

export default LambdaConnector;

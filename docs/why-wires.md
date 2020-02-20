# Why Wires?

Serverless computing can be seen as the last step in the process of abstraction we have seen in the past two or three decades. More and more complexity has disappeared from development. Today, programmers can focus more on writing business logic and less on auxiliary activities.

As we do not work with physical machines anymore, in serverless we do not have any infrastructure to manage. At least, in theory.

In practice, serverless consists of a set of services provided by a vendor (there are opensource solutions as well). Also other features (e.g. fault tolerance, scaling, load balancing) are usually managed by the platform.

Serverless services are typically abstractions for databases, rest endpoints and so on. Lambdas are the most important items in a serverless ecosystem. They are simple functions used to implement the custom business logic of an application.

A serverless configuration is a description of how different services are wired together. For example, a lambda can be connected to a database in order to access user information. There are several configuration languages and frameworks (e.g. AWS CloudFormation, Serverless Framework, Pulumi), with different philosophies and flavors. In general, we use configuration language to describe the wiring of a serverless network.

However, the complexity of serverless networks can increase very fast. It is the same problem we have with microservice architectures. The need of a high level language to compose networks together is a perceived problem in serverless community. There is a strong feeling that current solutions are not suitable to solve this problem [1, 2, 3].

Thinking in terms of networks or graphs instead of individual services could be the first step to make serverless more configuration-less.

Wires is a higher abstraction layer on the top of traditional configuration languages (for now only Pulumi). While configuration languages describe how to connect two services or nodes together, Wires says how to compose networks. Basically, the main unit of composition is not a service anymore, but a network.

We believe that this approach makes easier to reach the following goals:

- Reusing architectural patterns across different scenarios and technical needs.
- Verifying network correctness.
- Making explicit and available the context of a computation.
- Building robust and resilient serverless applications.

## References

1. Tim Wagner, [The State of Serverless, circa 2019](https://read.acloud.guru/the-state-of-serverless-circa-10-2019-2bfd0e605700), 2019
2. Ben Kehoe, [AWS CloudFormation is an infrastructure graph management service — and needs to act more like it](https://read.acloud.guru/cloudformation-is-an-infrastructure-graph-management-service-and-needs-to-act-more-like-it-fa234e567c82), 2019
3. Javier Toledo and Nick Tchaika [What Comes after Serverless? Less "Servers" and More "Less"!](https://acloud.guru/series/serverlessconf-nyc-2019/view/after-serverless), 2019

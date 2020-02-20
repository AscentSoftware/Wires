# AWS

Compiles a Wires network to an AWS configuration. Based on Pulumi.

## How it works

- A dependency tree is built from a Wires network.
- Following the tree order, AWS services are created using Pulumi API.

At the moment, we support `http-gateway`, `lambda` and `dynamodb`.

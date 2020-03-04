# Wires (Proof of Concept) 🚧

> ☢️ Unstable APIs, not ready for production ☢️

## What is Wires

Wires is a framework to build serverless applications in a compositional way.

It is inspired by recent work in Category Theory, but, instead of mathematical beauty and perfection, we want to understand what is possible to build with current well-known technologies and without requiring too advanced skills from Wires end users.

Several tools exists to describe serverless applications, e.g. [Serverless Framework](https://serverless.com/) and [Pulumi](https://www.pulumi.com/). The main difference between traditional tools and Wires is that, while the former ones say how to connect two services in a network, we want to compose _full_ graphs in a uniform abstract way.

We do not see Wires as an alternative to current solutions, but as a more abstract layer built on the top of them. The current implementation is based on Pulumi and would not have been possible without Pulumi closures.

[Read more](./docs/README.md)

## What we can do now

- We check some network properties using types (not perfect and with limitations, but we found it useful in practice).
- We share abstract architectural patterns as npm packages.
- We have complex working examples deployable to AWS.
- We use existing technologies (Typescript, Pulumi).

## What we would like to do

- Code is ugly, buggy and not production ready, we are working on a refactoring following more functional design principles.
- Type constraints can be improved and corrected.
- Several theoretical ideas can be borrowed and tested in this context (e.g. algebraic graphs, applied category theory).
- We would like to understand which is the best way to test/debug networks and not only functions (mocking vendor resources vs testing/debugging on the cloud).

## How to get started

Pre-requirements

- You need an AWS account
- You do not need a Pulumi account, you can store your app state locally, see [here](https://www.pulumi.com/docs/intro/concepts/state/#filesystem-or-local)
- Install `yarn` globally, `npm i yarn -g`

Installing and building

- Install depedencies: `yarn`
- Build project: `yarn build`

In `examples/` there are some demos.

- `cd examples/kss-demo`
- init a stack `pulumi stack init`
- if you use Pulimi locally as suggested above, a file `Pulumi.stack-name.yml` is created. You should set some properties for your environment

```yml
encryptionsalt: XXX
// add config, values depend on your settings
config:
  aws:region: eu-west-1
  aws:profile: default
```

Now you can deploy your application

- `pulumi up`

If you want to destroy your network (note that for some resources, e.g. elasticsearch, you pay per hour and not per request!):

- `pulumi destroy`

## Project structure

The project is a monorepo built with lerna.

- `examples/` examples and demos
- `packages/` various packages

The main packages are

- `packages/core` core language
- `packages/aws` "compiler" from abstract networks to AWS

Some Alexa infrastructural components and utilities

- `packages/alexa-*` (TODO move to another workspace)
- `alexa-utils` utilities to handle Alexa requests (TODO create an independent npm package)

## References and Inspiration Sources

- Robin Milner, “The Space and Motion of Communicating Agents”, 2009
- A. Mokhov, V. Khomenko. "Algebra of parameterised graphs" 2014
- L. Dixon, A. Kissinger. "Open graphs and monoidal theories" 2013
- Recent work on Category Theory and Functional Programming.
- [Lambda Powertools](https://github.com/getndazn/dazn-lambda-powertools)
- [TheBurningMonk](https://medium.com/theburningmonk-com/all-my-posts-on-serverless-aws-lambda-43c17a147f91)

## More Credits

- Diagrams made with [drawio](https://www.draw.io/).

# Serverless Networks

A serverless network consists of two main entities: lambdas and resources.

- A **lambda** is a short-lived computation with side effects and a **transient** state.
- A **resource** is an object with a persistent state that can emit events (e.g. databases).

We represent serverless networks as graphs as in the picture below.

![](images/serverless-network.png?raw=true)

More formally, nodes are lambda functions and edges are resources. Nodes and edges are connected by links. Since an edge can be connected to zero or more nodes, it is called multi-edge.

A lambda is a particular kind of graph with no edges, a single node (the lambda function itself) and zero or more open ends. Intuitively, open ends are virtual connections to something else.

![](images/lambda.png?raw=true)

A resource is again a graph with no nodes, no links and a single edge, that is, the resource itself.
Examples of resources are: databases, communication channels, queues and so forth.

We define a uniform composition mechanisms between serverless networks. When we compose two networks, we connect open ends with resources with the same name. No matter how big two networks are, composition is always the same (i.e. it is uniform).

For example, here, we compose two simple networks

![](images/simple-compose.png?raw=true)

The result is this network

![](images/composition-result.png?raw=true)

We believe that these simple rules are powerful enough to describe every sort of serveless diagram.

The actual implementation can be found in `packages/core`.

# References

There is a wide literature on composing networks. We borrowed several ideas from the following papers.

- Robin Milner, “The Space and Motion of Communicating Agents”, 2009
  - link graphs are very similar to our open graphs
- A. Mokhov, V. Khomenko. "Algebra of parameterised graphs" 2014
  - the idea of composition as "graph overlaying" and of correctness by construction
- L. Dixon, A. Kissinger. "Open graphs and monoidal theories" 2013
  - they define open graphs. Even if they are not extactly the same as ours, probably it is possible to encode one type into the other.

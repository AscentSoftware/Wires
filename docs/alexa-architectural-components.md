# Reuse architectural patterns: a case study for Alexa

# Prelude

A smart home skill is a service that enables Alexa voice interaction to control smart home devices.
Basically, Alexa interprets voice commands and sends directives to a skill. The skill executes a custom function implementing the desired semantics. No further knowledge of Alexa is required to understand the rest of this document, but you might want to check out the official documentation [1].

## A case study

![](images/alexa-usecase.png?raw=true)

Assume that we want to build Alexa-based integrations for light bulb manufacturers.

Usually, device manufacturers already have some REST APIs to control the state of their light bulbs. Then, an integration for a specific producer is nothing else but a translation service from `AlexaRequests` and `AlexaResponses` to the formats accepted by the producer's REST APIs.

This use case is illustrated in the diagram above. The main steps are:

- An Alexa Skill (blue square) sends a `TurnOn` directive to our system.
- Our system interacts with some 3rd party API (`AlexaRequest` > `HttpRequest` > `HttpResponse` > `AlexaResponse`).
- The resulting `AlexaResponse` is sent back to Alexa via an Alexa Gateway (red gateway).

However, REST APIs do not differ only in the format of their requests or responses. They can also be synchronous or asynchronous, have push notifications or not.

Here, we consider three possible scenarios:

- **Sync APIs.** APIs accept `HttpRequests` to change the state of a device and return an `HttpResponse` with the updated state of the device.
- **Async APIs with push notifications.** APIs accept `HttpRequests` to change the state of a device, but do not update its state immediately. Instead, they return an `HttpResponse` with `statusCode` [202](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/202) meaning that the command has been accepted, but the state has not been updated yet. The manufacturer's system will notify us when the new state will be available.
- **Async APIs without push notifications.** Same as above, but APIs do not implement push notifications. We need to emulate them using polling.

The three scenarios are represented in the following diagrams.

![](images/scenarios.png?raw=true)

As you can see, they are pretty similar. The main difference is that there are two different ways to handle API responses depending if they are sync or async. While for sync APIs the implementation is quite trivial, for async APIs we need to keep track of pending requests so that we are able to build an `AlexaResponse` when API state is updated.

We would like to reuse common configuration patterns. In this way, we do not have to rewrite the basics every time for different manufactures.

## Alexa Architectural Components

The first step is the identification of the architectural components in the three scenarios. A component is not a function (i.e. deterministic input/output behavior), but is a network with a "functional role" or a purpose.

![](images/scenarios-2.png?raw=true)

Here, we consider the following components, see highlighted subnetworks in the picture above.

- **Entrypoint.** The role of an Entrypoint is to handle `ReportState` and `Discover` directives, to register `AccessGrant` directives and to forward every other request returning immediately a `DeferredResponse` to the skill.
- **Sync Processor.** The role of a Sync Processor is to build an HTTP request from a directive, send it to APIs, build an `AlexaResponse` from an updated state included in the HTTP response and send it back to Alexa.
- **Async Processor.** The role of an Async Processor is to build an HTTP request from a directive, send it to APIs and register the fact that a request has been made. When APIs send back a response in an async way (we do not know here if with push notifications or polling), it builds an `AlexaResponse` and sends it to Alexa.
- **Dispatcher.** The role of a Dispatcher is to keep track of access codes and forward `AlexaResponses` to a Alexa after fetching an access token.
- **Hook.** The role of a hook is to accept state reports from an external system.
- **Polling.** The role of a Polling is to poll an external system with some frequency.

## Truly compositional composition

Following the simple composition semantics described [here](./serverless-diagram.md), we can reuse the same architectural components for the different scenarios.

Network for Sync APIs.
![](images/composition-sync-api.png?raw=true)

Network for Async APIs.
![](images/composition-async-api.png?raw=true)

## Relevant code

The scenario are implemented in code.

Packages

- `packages/alexa-async-dispatcher`
- `packages/alexa-async-entrypoint`
- `packages/alexa-resources`
- `packages/async-api-processor`
- `packages/sync-api-processor`

Demos

- `examples/alexa-deferred-with-async-api`: Integration with Async API
- `examples/alexa-deferred-with-sync-api`: Integration with Sync API

## References

1. [Alexa Smart Home Skill API](https://developer.amazon.com/en-US/docs/alexa/smarthome/understand-the-smart-home-skill-api.html)

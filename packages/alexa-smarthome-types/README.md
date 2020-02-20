# Alexa SmartHome Typescript

Typescript deinitions for Alexa Smart Home.

## Why

Alexa SmartHome data model is quite complex. It is easy to forget mandatory properties or to return an unexpected state.
Types can help us at compile time to build the right responses for intents without looking up the documentation and wasting time in debugging.

Our goal is to build a "good enough" representation of the data model. Typescript is able to define not only the shape of an entity, but also
constraints between concepts (e.g. a capability can have a precise set of properties different from those of others).

Nevertheless, some features of the model might not be expressible in Typescript or require too hacky solutions. In those cases, we prefer the simplest approach even if it is not faithful to the reference model. Programming is always a compromise between expressivity/correctness and productivity.

## How it works

This package is based on [declaration merging and module augumentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html).
In this way, it can be easily extended with new events and directives. Follow the examples to add a new event or directive.

[Mapped types](https://www.typescriptlang.org/docs/handbook/advanced-types.html#mapped-types) are used to enforce constraints between type definitions.
In particular:

* `Capabilities` is a table listing all available capabilities.
* `Properties` maps a capability to corresponding properties (used in discovery and state events),
* `Directives` maps a capability to corresponding directives.
* `Payloads` maps a directive to the corresponding input payload (if any).

## Styling

* Follow [Typescript Deep Dive](https://basarat.gitbooks.io/typescript/).
* Add support for `editorconfig`, `tslint` and `prettier` to your editor.

## Contributing

The current implementation is still incomplete. We are looking for help to complete the library! PRs are welcome. ❤️

## References

* [Documentation](https://developer.amazon.com/docs/smarthome/smart-home-skill-api-message-reference.html)
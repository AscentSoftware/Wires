import { Network, Resource, Names, Link, Lambda, Event, LambdaContext } from '@wires/core';
import { Directive, AlexaResponse, AlexaErrorResponse } from 'alexa-smarthome-ts';

export interface AlexaHomeSkillEvent {
  event: Directive;
}

export interface AlexaSkillOptions<S extends string, N extends string, E> {
  name: N;
  skillName: S;
  handler: (
    event: Event<S, 'event', Directive>,
    context: LambdaContext<E>,
    runtime: unknown,
  ) => Promise<AlexaResponse | AlexaErrorResponse>;
  effects: {
    [k in keyof E]: any; // TODO how to infer more properties
  };
}

export interface AlexaHomeSkillResource {
  kind: 'alexa-home-skill';
  spec: {
    name: string;
    lambda: string;
  };
}

/**
 * Alexa Home Skill
 *
 * Skills are available only on AWS and we should have 1 skill = 1 lambda.
 * Here we enforce this constaint defining a proper constructor
 *
 */
const alexaHomeSkill = <S extends string, N extends string, E>({
  skillName,
  name,
  handler,
  effects,
}: AlexaSkillOptions<S, N, E>): Network<
  Lambda<N, Directive, AlexaResponse | AlexaErrorResponse, E>,
  Resource<S, never, AlexaHomeSkillEvent>,
  Link<N, keyof E, S>,
  Names<keyof E>
> => {
  return {
    resources: {
      [skillName]: { kind: 'alexa-home-skill', spec: { name: skillName, lambda: name } as any },
    } as Resource<S, never, AlexaHomeSkillEvent>,
    lambdas: {
      [name]: { name, handler },
    } as Lambda<N, Directive, AlexaResponse | AlexaErrorResponse, E>,
    links: ({
      [name]: { effects, events: { [skillName]: { event: {} } } },
    } as unknown) as Link<N, keyof E, S>, // TODO fix
    names: Object.keys(effects) as Names<keyof E>,
  };
};

export default alexaHomeSkill;

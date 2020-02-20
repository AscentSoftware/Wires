// capability
export const POWER_CONTROLLER = 'Alexa.PowerController';

// directives
export const TURN_ON_DIRECTIVE = 'TurnOn';
export const TURN_OFF_DIRECTIVE = 'TurnOff';

export type PowerState = 'ON' | 'OFF';

declare module '../base/Capabilities' {
  interface Capabilities {
    [POWER_CONTROLLER]: true;
  }
}

declare module '../base/Properties' {
  interface Properties {
    [POWER_CONTROLLER]: {
      powerState: PowerState;
    };
  }
}

declare module '../base/Directives' {
  interface Directives {
    [POWER_CONTROLLER]: {
      [TURN_ON_DIRECTIVE]: true;
      [TURN_OFF_DIRECTIVE]: true;
    };
  }
}

declare module '../base/Payloads' {
  interface Payloads {
    [TURN_ON_DIRECTIVE]: {};
    [TURN_OFF_DIRECTIVE]: {};
  }
}

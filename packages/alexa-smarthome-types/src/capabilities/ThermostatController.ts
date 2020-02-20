// capability
export const THERMOSTAT_CONTROLLER = 'Alexa.ThermostatController';

// directives
export const SET_THERMOSTAT_MODE_DIRECTIVE = 'SetThermostatMode';
export const SET_TARGET_TEMPERATURE = 'SetTargetTemperature';
export const ADJUST_TARGET_TEMPERATURE = 'AdjustTargetTemperature';

export type TemperatureScale = 'CELSIUS' | 'FAHRENHEIT' | 'KELVIN';

export type ThermostatMode = 'AUTO' | 'COOL' | 'HEAT' | 'ECO' | 'OFF';

export interface Temperature {
  value: number;
  scale: TemperatureScale;
}

declare module '../base/Capabilities' {
  interface Capabilities {
    [THERMOSTAT_CONTROLLER]: true;
  }
}

declare module '../base/Properties' {
  interface Properties {
    [THERMOSTAT_CONTROLLER]: {
      targetSetpoint: Temperature;
      thermostatMode: ThermostatMode;
      lowerSetpoint?: Temperature;
      upperSetpoint?: Temperature;
    };
  }
}

declare module '../base/Directives' {
  interface Directives {
    [THERMOSTAT_CONTROLLER]: {
      [SET_THERMOSTAT_MODE_DIRECTIVE]: true;
      [SET_TARGET_TEMPERATURE]: true;
      [ADJUST_TARGET_TEMPERATURE]: true;
    };
  }
}

declare module '../base/Payloads' {
  interface Payloads {
    [SET_THERMOSTAT_MODE_DIRECTIVE]: {
      thermostatMode: {
        value: ThermostatMode;
      };
    };
    [SET_TARGET_TEMPERATURE]: {
      targetSetpoint: Temperature;
    };
    [ADJUST_TARGET_TEMPERATURE]: {
      targetSetpointDelta: Temperature;
    };
  }
}

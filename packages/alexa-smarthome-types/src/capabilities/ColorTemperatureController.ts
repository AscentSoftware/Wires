/**
 * @see https://developer.amazon.com/docs/device-apis/alexa-colortemperaturecontroller.html
 */
// capability
export const COLOR_TEMPERATURE_CONTROLLER = 'Alexa.ColorTemperatureController';

// directives
export const DECREASE_COLOR_TEMPERATURE_DIRECTIVE = 'DecreaseColorTemperature';
export const INCREASE_COLOR_TEMPERATURE_DIRECTIVE = 'IncreaseColorTemperature';
export const SET_COLOR_TEMPERATURE_DIRECTIVE = 'SetColorTemperature';

declare module '../base/Capabilities' {
  interface Capabilities {
    [COLOR_TEMPERATURE_CONTROLLER]: true;
  }
}

declare module '../base/Properties' {
  interface Properties {
    [COLOR_TEMPERATURE_CONTROLLER]: {
      colorTemperatureInKelvin: number;
    };
  }
}

declare module '../base/Directives' {
  interface Directives {
    [COLOR_TEMPERATURE_CONTROLLER]: {
      [DECREASE_COLOR_TEMPERATURE_DIRECTIVE]: true;
      [INCREASE_COLOR_TEMPERATURE_DIRECTIVE]: true;
      [SET_COLOR_TEMPERATURE_DIRECTIVE]: true;
    };
  }
}

declare module '../base/Payloads' {
  interface Payloads {
    [DECREASE_COLOR_TEMPERATURE_DIRECTIVE]: {};
    [INCREASE_COLOR_TEMPERATURE_DIRECTIVE]: {};
    [SET_COLOR_TEMPERATURE_DIRECTIVE]: {
      colorTemperatureInKelvin: number;
    };
  }
}

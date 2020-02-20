/**
 * @see https://developer.amazon.com/docs/device-apis/alexa-colorcontroller.html
 */
// capability
export const COLOR_CONTROLLER = 'Alexa.ColorController';

// directives
export const SET_COLOR_DIRECTIVE = 'SetColor';

declare module '../base/Capabilities' {
  interface Capabilities {
    [COLOR_CONTROLLER]: true;
  }
}

declare module '../base/Properties' {
  interface Properties {
    [COLOR_CONTROLLER]: {
      color: {
        hue: number;
        saturation: number;
        brightness: number;
      };
    };
  }
}

declare module '../base/Directives' {
  interface Directives {
    [COLOR_CONTROLLER]: {
      [SET_COLOR_DIRECTIVE]: true;
    };
  }
}

// see https://developer.amazon.com/docs/device-apis/alexa-property-schemas.html#color
declare module '../base/Payloads' {
  interface Payloads {
    [SET_COLOR_DIRECTIVE]: {
      color: {
        hue: number;
        saturation: number;
        brightness: number;
      };
    };
  }
}

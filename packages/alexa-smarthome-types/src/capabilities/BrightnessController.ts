/**
 * @see https://developer.amazon.com/docs/device-apis/alexa-brightnesscontroller.html
 */
export const BRIGHTNESS_CONTROLLER = 'Alexa.BrightnessController';

// directives
export const SET_BRIGHTNESS_DIRECTIVE = 'SetBrightness';
export const ADJUST_BRIGHTNESS_DIRECTIVE = 'AdjustBrightness';

declare module '../base/Capabilities' {
  interface Capabilities {
    [BRIGHTNESS_CONTROLLER]: true;
  }
}

declare module '../base/Properties' {
  interface Properties {
    [BRIGHTNESS_CONTROLLER]: {
      brightness: number;
    };
  }
}

declare module '../base/Directives' {
  interface Directives {
    [BRIGHTNESS_CONTROLLER]: {
      [SET_BRIGHTNESS_DIRECTIVE]: true;
      [ADJUST_BRIGHTNESS_DIRECTIVE]: true;
    };
  }
}

declare module '../base/Payloads' {
  interface Payloads {
    [SET_BRIGHTNESS_DIRECTIVE]: {
      brightness: number;
    };
    [ADJUST_BRIGHTNESS_DIRECTIVE]: {
      brightnessDelta: number;
    };
  }
}

// capability
export const LOCK_CONTROLLER = 'Alexa.LockController';

// directives
export const LOCK_DIRECTIVE = 'Lock';
export const UNLOCK_DIRECTIVE = 'Unlock';

export type LockState = 'LOCKED' | 'UNLOCKED';

declare module '../base/Capabilities' {
  interface Capabilities {
    [LOCK_CONTROLLER]: true;
  }
}

declare module '../base/Properties' {
  interface Properties {
    [LOCK_CONTROLLER]: {
      lockState: LockState;
    };
  }
}

declare module '../base/Directives' {
  interface Directives {
    [LOCK_CONTROLLER]: {
      [LOCK_DIRECTIVE]: true;
      [UNLOCK_DIRECTIVE]: true;
    };
  }
}

declare module '../base/Payloads' {
  interface Payloads {
    [LOCK_DIRECTIVE]: {};
    [UNLOCK_DIRECTIVE]: {};
  }
}

// Indicates the endpoint is a television.
export const TV = 'TV';

// Indicates a door.
export const DOOR = 'DOOR';

// Indicates light sources or fixtures.
export const LIGHT = 'LIGHT';

// An endpoint that cannot be described in on of the other categories.
export const OTHER = 'OTHER';

// Indicates in wall switches wired to the electrical system.
// Can control a variety of devices.
export const SWITCH = 'SWITCH';

// Indicates media devices with video or photo capabilities.
export const CAMERA = 'CAMERA';

// Indicates the endpoint is a speaker or speaker system.
export const SPEAKER = 'SPEAKER';

// Indicates an endpoint that locks.
export const SMARTLOCK = 'SMARTLOCK';

// Indicates modules that are plugged into an existing electrical outlet.
// Can control a variety of devices.
export const SMARTPLUG = 'SMARTPLUG';

// Indicates a microwave oven endpoint.
export const MICROWAVE = 'MICROWAVE';

// Indicates endpoints that control temperature,
// stand - alone air conditioners, or heaters with direct temperature control.
export const THERMOSTAT = 'THERMOSTAT';

// Describes a combination of devices set to a specific state
//  when the order of the state change is not important
// For example a bedtime scene might include turning off lights and
// lowering the thermostat, but the order is unimportant.Applies to Scenes
export const SCENE_TRIGGER = 'SCENE_TRIGGER';

// Describes a combination of devices set to a specific state, when the
// state change must occur in a specific order.For example, a "watch Neflix"
// scene might require the: 1. TV to be powered on & 2. Input set to HDMI1
// Applies to Scenes
export const ACTIVITY_TRIGGER = 'ACTIVITY_TRIGGER';

// Indicates endpoints that report the temperature only.
export const TEMPERATURE_SENSOR = 'TEMPERATURE_SENSOR';

// Indicates an endpoint that detects and reports
// changes in contact between two surfaces.
export const CONTACT_SENSOR = 'CONTACT_SENSOR';

// Indicates an endpoint that detects and reports movement in an area.
export const MOTION_SENSOR = 'MOTION_SENSOR';

import * as THREE from 'three';

import { CarHeadlightDayModeOptions } from '../models/car/car-headlight';
import { LightingOptions } from '../models/lighting/lighting';

/**
 * Class whose values (DAY and NIGHT) contain the data required to go to
 * the new day mode.
 *
 * Implementation of the State pattern.
 */
export interface DayMode {
    CAR_HEADLIGHT_OPTIONS: CarHeadlightDayModeOptions;
    LIGHTING_OPTIONS: LightingOptions;
    nextMode(): DayMode;
}

export declare const DayMode: {readonly DAY: DayMode, readonly NIGHT: DayMode};

export class DayModeDay implements DayMode {
    public get CAR_HEADLIGHT_OPTIONS(): CarHeadlightDayModeOptions {
        return { intensity: 0 };
    }

    public get LIGHTING_OPTIONS(): LightingOptions {
        const COLOR = 0xfff6a3;
        return {
            keyLight: {
                color: COLOR,
                intensity: 1,
                rotation: new THREE.Euler(0.478, 1.837, 0, 'YXZ')
            },
            backlight: {
                color: COLOR,
                intensity: 0.4,
                rotation: new THREE.Euler(Math.PI / 8, -3 * Math.PI / 4, 0, 'YXZ')
            }
        };
    }

    public nextMode(): DayMode {
        return DayMode.NIGHT;
    }

}

export class DayModeNight implements DayMode {
    public get CAR_HEADLIGHT_OPTIONS(): CarHeadlightDayModeOptions {
        return { intensity: 1 };
    }

    public get LIGHTING_OPTIONS(): LightingOptions {
        const COLOR = 0xe8e7e3;
        return {
            keyLight: {
                color: COLOR,
                intensity: 0.33,
                rotation: new THREE.Euler(0.374, 2.760, 0, 'YXZ')
            },
            backlight: {
                color: COLOR,
                intensity: 0.11,
                rotation: new THREE.Euler(Math.PI / 8, -Math.PI / 2, 0, 'YXZ')
            }
        };
    }

    public nextMode(): DayMode {
        return DayMode.DAY;
    }

}

(DayMode as any) = {DAY: new DayModeDay(), NIGHT: new DayModeNight()};

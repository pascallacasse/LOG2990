import * as THREE from 'three';

import { Logger } from '../../../../../../../common/src';
import { UserControllableCollidableMesh } from '../../physic/user-controllable-collidable';
import { DynamicCollidableMesh } from '../../physic/dynamic-collidable';
import { Loadable } from '../../../../loadable';
import { CarPartsLoader } from './car-parts-loader';
import { CarHeadlight, CarHeadlightDayModeOptions } from './car-headlight';
import { CarBreaklight } from './car-breaklight';
import { Kilograms, Seconds } from '../../../../types';
import { DayMode } from '../../day-mode/day-mode';
import { PhysicUtils } from '../../physic/engine';
import { SoundEmitter } from '../../sound/sound-emitter';
import { Sound } from '../../../services/sound';

export interface CarLights {
    lightLeft: THREE.Light;
    lightRight: THREE.Light;
}

const logger = Logger.getLogger('Car');
const MIN_RATE = 0.4;

export class Car extends UserControllableCollidableMesh implements Loadable, SoundEmitter {
    private static readonly MAX_ANGULAR_VELOCITY_TO_SPEED_RATIO = (Math.PI / 4) / (1); // (rad/s) / (m/s)

    private static readonly HEADLIGHT_POSITIONS: THREE.Vector3[] = [
        new THREE.Vector3(-0.56077, 0.63412, -1.7),
        new THREE.Vector3(0.56077, 0.63412, -1.7)
    ];
    private static readonly BREAKLIGHT_POSITIONS: THREE.Vector3[] = [
        new THREE.Vector3(-0.50077, 0.63412, 1.8),
        new THREE.Vector3(0.50077, 0.63412, 1.8)
    ];

    public readonly mass: Kilograms = 100;

    protected lights: CarLights;
    protected breakLights: CarLights;
    protected breakLightMeshs: THREE.Mesh;
    protected isStopped = false;

    protected targetSpeed = 50; // m/s
    protected targetAngularSpeed = Math.PI; // rad/s

    private previousVelocity = new THREE.Vector3();

    public readonly waitToLoad: Promise<void>;
    public readonly dimensions: THREE.Vector3 = new THREE.Vector3();
    public readonly eventAudios: Map<Sound, THREE.PositionalAudio> = new Map();
    public readonly constantAudios: Map<Sound, THREE.PositionalAudio> = new Map();
    public readonly eventSounds: Sound[] = [Sound.CAR_CRASH,
                                            Sound.BOOST_START,
                                            Sound.BOOST_END,
                                            Sound.POTHOLE,
                                            Sound.PUDDLE];
    public readonly constantSounds: Sound[] = [Sound.CAR_ENGINE];

    protected dayModeOptions: CarHeadlightDayModeOptions;

    constructor(carColor: THREE.Color) {
        super();
        this.addLights();
        this.waitToLoad = this.addCarParts(carColor);
        this.waitToLoad.then(() => {
            this.breakLightMeshs = this.getObjectByName('brake_light') as THREE.Mesh;
            this.dimensions.copy(PhysicUtils.getObjectDimensions(this));
        });
    }

    public onAudioSet(sound: Sound, audio: THREE.PositionalAudio): void {
        this.add(audio);
        if (sound === Sound.CAR_ENGINE) {
            audio.setVolume(1);
            audio.setPlaybackRate(MIN_RATE);
        }
    }

    public onAudioRemove(sound: Sound, audio: THREE.PositionalAudio): void {
        this.remove(audio);
    }

    private async addCarParts(color: THREE.Color): Promise<void> {
        this.add(... await CarPartsLoader.CAR_PARTS.then((parts) =>
            parts.map((mesh) => mesh.clone())
                .map((mesh) => {
                    mesh.material = (mesh.material as THREE.Material).clone();
                    return mesh;
                })
        ));

        this.add(... await CarPartsLoader.CAR_COLORED_PARTS.then((parts) =>
            parts.map((mesh) => mesh.clone()).map((coloredMesh) => {
                coloredMesh.material = (coloredMesh.material as THREE.MeshPhongMaterial).clone();
                (<THREE.MeshPhongMaterial>coloredMesh.material).color.set(color);
                return coloredMesh;
            })
        ));
    }

    public updateAngularVelocity(deltaTime: Seconds) {
        const angularVelocityToSpeedRatio = this.angularVelocity.length() / this.velocity.length();
        if (angularVelocityToSpeedRatio > Car.MAX_ANGULAR_VELOCITY_TO_SPEED_RATIO) {
            this.angularVelocity.setLength(Car.MAX_ANGULAR_VELOCITY_TO_SPEED_RATIO * this.velocity.length());
        }
        super.updateAngularVelocity(deltaTime);
    }

    public updatePhysic(utils: PhysicUtils, deltaTime: Seconds) {
        super.updatePhysic(utils, deltaTime);

        this.updateEnginePitch();
        this.checkIfCarIsStopped();
        this.updateBreaklights();
    }

    private checkIfCarIsStopped(): void {
        const currentSpeed = this.velocity.length();
        if (this.isStopped && currentSpeed > DynamicCollidableMesh.MIN_SPEED) {
            this.isStopped = false;
        }
        if (!this.isStopped && currentSpeed <= DynamicCollidableMesh.MIN_SPEED) {
            this.isStopped = true;
        }
    }

    private updateEnginePitch(): void {
        const PITCH_FACTOR = 2;
        const playbackRate = PITCH_FACTOR * (this.velocity.length() / this.targetSpeed) + MIN_RATE;
        if (this.constantAudios.has(Sound.CAR_ENGINE)) {
            this.constantAudios.get(Sound.CAR_ENGINE).setPlaybackRate(playbackRate);
        }
    }

    private updateBreaklights(): void {
        const EPSILON = 0.005;
        if (this.breakLightMeshs != null && this.dayModeOptions != null) {
            let breakLightsIntensity: number;
            if (this.isStopped ||
                this.velocity.length() < this.previousVelocity.length() - EPSILON) {
                breakLightsIntensity = 1;
            }
            else {
                breakLightsIntensity = 0.5 * Math.min(this.dayModeOptions.intensity, 1);
            }
            (this.breakLightMeshs.material as THREE.MeshPhongMaterial).emissiveIntensity = breakLightsIntensity;
            this.breakLights.lightLeft.intensity = this.breakLights.lightRight.intensity = breakLightsIntensity;
        }
        this.previousVelocity.copy(this.velocity);
    }

    private addLights(): void {
        const HEADLIGHT_FRONT_DIRECTION = new THREE.Vector3(0, -0.25, -1);
        const BREAKLIGHT_FRONT_DIRECTION = new THREE.Vector3(0, 0, 1);

        const headlights = Car.HEADLIGHT_POSITIONS.map((headlightPosition) =>
            this.setupLight(new CarHeadlight(), headlightPosition, HEADLIGHT_FRONT_DIRECTION)
        );
        const breaklights = Car.BREAKLIGHT_POSITIONS.map(breaklightPosition =>
            this.setupLight(new CarBreaklight(), breaklightPosition, BREAKLIGHT_FRONT_DIRECTION)
        );

        this.lights = {
            lightLeft: headlights[0],
            lightRight: headlights[1]
        };
        this.breakLights = {
            lightLeft: breaklights[0],
            lightRight: breaklights[1]
        };
        this.add(...headlights, ...breaklights);
    }

    private setupLight(light: THREE.SpotLight, lightPosition: THREE.Vector3, lightFrontDirection: THREE.Vector3) {
        light.position.copy(lightPosition);
        light.target.position.copy(
            lightPosition.clone().add(lightFrontDirection)
        );

        this.add(light.target);
        return light;
    }

    public startSounds() {
        if (this.constantAudios.has(Sound.CAR_ENGINE)) {
            this.constantAudios.get(Sound.CAR_ENGINE).setVolume(1);
        }
    }

    public stopSounds() {
        if (this.constantAudios.has(Sound.CAR_ENGINE)) {
            this.constantAudios.get(Sound.CAR_ENGINE).setVolume(0);
        }
    }

    public dayModeChanged(newMode: DayMode): void {
        this.dayModeOptions = newMode.CAR_HEADLIGHT_OPTIONS;
        const lights = this.getObjectByName('lights') as THREE.Mesh;
        const breakLightMeshs = this.getObjectByName('brake_light') as THREE.Mesh;
        if (lights && breakLightMeshs) {
            (<THREE.MeshPhongMaterial>lights.material).emissiveIntensity = this.dayModeOptions.intensity;
            (<THREE.MeshPhongMaterial>breakLightMeshs.material).emissiveIntensity =
                0.5 * this.dayModeOptions.intensity + (this.isStopped ? 0.5 : 0);
        }
    }

}

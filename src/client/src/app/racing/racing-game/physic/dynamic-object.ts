import { IPhysicElement, PhysicMesh } from './object';
import * as THREE from 'three';
import { PhysicUtils } from './engine';
import { Seconds } from '../../types';
import { hasAttributes, hasFunctions } from '../../../../../../common/src/utils';

export interface DynamicPhysicElement extends IPhysicElement {
    velocity: THREE.Vector3; // meters / seconds
    angularVelocity: THREE.Vector3; // radiants / seconds
    updatePosition(deltaTime: Seconds): void;
    updateVelocity(deltaTime: Seconds): void;
    updateRotation(deltaTime: Seconds): void;
    updateAngularVelocity(deltaTime: Seconds): void;
}

export function isDynamicPhysicElement(object: any): object is DynamicPhysicElement {
    return hasAttributes(object, [
        {name: 'velocity', parent: THREE.Vector3},
        {name: 'angularVelocity', parent: THREE.Vector3}
    ]) && hasFunctions(object, [
        {name: 'updatePosition', parameterCount: 1},
        {name: 'updateVelocity', parameterCount: 1},
        {name: 'updateRotation', parameterCount: 1},
        {name: 'updateAngularVelocity', parameterCount: 1}
    ]);
}

export abstract class DynamicPhysicMesh extends PhysicMesh implements DynamicPhysicElement {
    public static readonly MIN_SPEED: number = 0.1; // m/s
    public static readonly MIN_ANGULAR_SPEED: number = 0.01 * Math.PI; // rad/s

    public velocity: THREE.Vector3 = new THREE.Vector3();
    public angularVelocity: THREE.Vector3 = new THREE.Vector3();

    public update(engine: PhysicUtils, deltaTime: Seconds): void {
        super.update(engine, deltaTime);
        this.updateVelocity(deltaTime);
        this.updateAngularVelocity(deltaTime);

        this.updatePosition(deltaTime);
        this.updateRotation(deltaTime);
    }

    public updatePosition(deltaTime: Seconds): void {
        this.position.addScaledVector(this.velocity, deltaTime); // x = x0 + v*t
    }

    public updateVelocity(deltaTime: Seconds): void {
        if (this.velocity.length() < DynamicPhysicMesh.MIN_SPEED) {
            this.velocity.set(0, 0, 0);
        }
        this.velocity.setY(0);
    }

    public updateRotation(deltaTime: Seconds): void {
        const rotation = new THREE.Quaternion().setFromEuler(this.rotation);
        const angularVelocityAngleRate = this.angularVelocity.length();
        const angularVelocityDirection = this.angularVelocity.clone().normalize();

        const deltaRotation = new THREE.Quaternion()
            .setFromAxisAngle(angularVelocityDirection, angularVelocityAngleRate * deltaTime);
        const newRotation = rotation.premultiply(deltaRotation);

        this.rotation.setFromQuaternion(newRotation);
    }

    public updateAngularVelocity(deltaTime: Seconds): void {
        if (this.angularVelocity.length() < DynamicPhysicMesh.MIN_ANGULAR_SPEED) {
            this.angularVelocity.set(0, 0, 0);
        }
        this.angularVelocity.multiply(new THREE.Vector3(0, 1, 0));
    }
}

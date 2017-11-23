import { Line } from '../../../../common/src/math/line';
import { Point } from '../../../../common/src/math/point';
import { Projection } from './projection';
import { Vector } from '../../../../common/src/math/vector';
import { Meters } from '../types';

export class MapPositionAlgorithms {

    public static getProjectionOnLine(position: Point, line: Line): Projection {
        const origin: Point = line.origin;
        const pointVector: Vector = new Vector(position.x - origin.x, position.y - origin.y);
        const lineVector: Vector = new Vector(line.destination.x - origin.x, line.destination.y - origin.y);

        const dot: number = pointVector.scalar(lineVector);
        const interpolation: number = dot / this.squaredNorm(lineVector);

        const interpolationPoint: Point = line.interpolate(interpolation);

        const distanceToSegment: number = interpolationPoint.distanceTo(position);

        return new Projection(interpolation, line, distanceToSegment);
    }

    public static getClosestProjection(position: Point, lines: Line[]): Projection {
        const projections: Projection[] = this.getAllProjections(position, lines);
        let closestProjection = projections[0];
        for (const projection of projections) {
            if (projection.distanceToSegment < closestProjection.distanceToSegment) {
                closestProjection = projection;
            }
        }
        return closestProjection;
    }

    public static getAllProjections(position: Point, lines: Line[]): Projection[] {
        const projections: Projection[] = [];
        for (const line of lines) {
            projections.push(this.getProjectionOnLine(position, line));
        }
        return projections;
    }

    public static getPointAtGivenDistance(distance: Meters, lines: Line[]): Point {
        const lineAtDistance = lines.find((line) => {
            const predicate = distance < line.length;
            if (!predicate) {
                distance -= line.length;
            }
            return predicate;
        });
        return lineAtDistance.interpolate(distance / lineAtDistance.length);
    }

    public static getTrackLength(lines: Line[]): Meters {
        return lines.reduce((accumulatedLength, line) => accumulatedLength + line.length, 0);
    }

    private static squaredNorm(vec: Point): number {
        return vec.x ** 2 + vec.y ** 2;
    }
}

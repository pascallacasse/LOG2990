import { Path } from './path';
import { Pothole } from './pothole';
import { Puddle } from './puddle';
import { SpeedBoost } from './speed-boost';
import { Point } from './point';
import { Vector } from './vector';
import { Line, IntersectionType } from './line';

export const MIN_ANGLE = Math.PI / 4;
export const MAP_TYPES = ['Amateur', 'Professional'];

export const MIN_LINE_LENGTH = 10.0;


enum MapError {
    NONE = 0,       // No error
    NOT_CLOSED,     // Map path is not closed
    SMALL_ANGLE,    // An angle is < 45°
    SEGMENT_LENGTH, // A segment is to small
    LINES_CROSS     // Two lines cross
}

export class Map {
    public path: Path;
    public potholes: Pothole[] = [];
    public puddles: Puddle[] = [];
    public speedBoosts: SpeedBoost[] = [];

    public name: string;
    public description: string;
    public type: string;
    public sumRatings: number;
    public numberOfRatings: number;
    public plays: number;

    constructor(path: Path = new Path(),
                name: string = '',
                description: string = '',
                type: string = 'Amateur',
                potholes: Pothole[] = [],
                puddles: Puddle[] = [],
                speedBoosts: SpeedBoost[] = [],
                sumRatings: number = 0,
                numberOfRatings: number = 0,
                plays: number = 0) {
        this.path = path;
        this.name = name;
        this.description = description;
        this.type = type;
        this.potholes.push.apply(this.potholes, potholes);
        this.puddles.push.apply(this.puddles, puddles);
        this.speedBoosts.push.apply(this.speedBoosts, speedBoosts);
        this.sumRatings = sumRatings;
        this.numberOfRatings = numberOfRatings;
        this.plays = plays;
    }

    public get rating(): number {
        let rating: number;
        if (this.numberOfRatings !== 0) {
            rating = this.sumRatings / this.numberOfRatings;
        }
        else {
            rating = 0;
        }
        return rating;
    }

    public computeLength(): number {
        const POINTS = this.path.points;
        let length = 0;
        for (let i = 0; i < POINTS.length - 1; i++) {
            const VECTOR = Vector.fromPoints(POINTS[i], POINTS[i + 1]);
            length += VECTOR.norm();
        }
        return length;
    }

    public firstStretchLength(): number {
        if (this.path.points.length >= 2) {
            const POINT1 = this.path.points[0];
            const POINT2 = this.path.points[1];
            return Vector.fromPoints(POINT1, POINT2).norm();
        }
        else {
            throw new Error('Insufficient points');
        }
    }

    public computeErroneousLines(): Line[] {
        const ERRONEOUS_LINES: Line[] = [];

        const BAD_ANGLES: [Point, Point, Point][] = this.computeBadAngles();
        BAD_ANGLES.forEach((angle: [Point, Point, Point]) => {
            ERRONEOUS_LINES.push(new Line(angle[0], angle[1]), new Line(angle[1], angle[2]));
        });
        const CROSSING_LINES: [Line, Line][] = this.computeCrossingLines();
        CROSSING_LINES.forEach((lines: [Line, Line]) => {
            ERRONEOUS_LINES.push(lines[0], lines[1]);
        });
        const SMALL_SEGMENTS: Line[] = this.computeSmallSegments();
        ERRONEOUS_LINES.concat(SMALL_SEGMENTS);

        return ERRONEOUS_LINES;
    }

    public isValid(): boolean {
        return this.isClosed() &&
               this.computeBadAngles().length === 0 &&
               this.computeCrossingLines().length === 0 &&
               this.computeSmallSegments().length === 0;
    }

    private computeBadAngles(): [Point, Point, Point][] {
        const POINTS = [];
        POINTS.push.apply(POINTS, this.path.points);

        if (this.isClosed()) {
            POINTS.push(POINTS[1]);
        }

        const BAD_ANGLES: [Point, Point, Point][] = [];
        for (let i = 0; i < POINTS.length - 2; i++) {
            const POINT1 = POINTS[i];
            const POINT2 = POINTS[i + 1];
            const POINT3 = POINTS[i + 2];
            const VECTOR1 = Vector.fromPoints(POINT1, POINT2);
            const VECTOR2 = Vector.fromPoints(POINT3, POINT2);
            const ANGLE =
                Math.min(VECTOR1.angleTo(VECTOR2), VECTOR2.angleTo(VECTOR1));

            if (Math.abs(ANGLE) < MIN_ANGLE) {
                BAD_ANGLES.push([POINT1, POINT2, POINT3]);
            }
        }
        if (BAD_ANGLES.length !== 0) {
            console.log('---BAD_ANGLES---');
        }
        return BAD_ANGLES;
    }

    public isClosed(): boolean {
        if (!(this.path.points.length > 2
            && this.path.points[0].equals(
               this.path.points[this.path.points.length - 1]))) {
            console.log('---NOT CLOSED---');
        }
        return this.path.points.length > 2
            && this.path.points[0].equals(
               this.path.points[this.path.points.length - 1]);
    }

    private computeCrossingLines(): [Line, Line][] {
        const POINTS = this.path.points;
        const LINES_THAT_CROSS: [Line, Line][] = [];
        const LINES: Line[] = [];
        for (let i = 0; i < POINTS.length - 1; i++) {
            LINES.push(new Line(POINTS[i], POINTS[i + 1]));
        }

        const logicImplies = (p: boolean, q: boolean): boolean => ((!p) || q);
        for (let i = 0; i < LINES.length - 1; i++) {
            for (let j = i + 1; j < LINES.length; j++) {

                const INTERSECTION = LINES[i].intersectsWith(LINES[j]);

                const IS_INTERSECTING = (INTERSECTION !== IntersectionType.INTERSECT_NONE);
                const PATH_CLOSED = this.isClosed();
                const NOT_NEIGHBORS = (j !== i + 1 && logicImplies(PATH_CLOSED, logicImplies(i === 0, j !== LINES.length - 1)));
                const INTERSECTION_IS_POINT = (INTERSECTION === IntersectionType.INTERSECT_POINT);

                if (IS_INTERSECTING && logicImplies(INTERSECTION_IS_POINT, NOT_NEIGHBORS)) {
                    LINES_THAT_CROSS.push([LINES[i], LINES[j]]);
                }
            }
        }
        if (LINES_THAT_CROSS.length !== 0) {
            console.log('---LINES CROSS---');
        }
        return LINES_THAT_CROSS;
    }

    private computeSmallSegments(): Line[] {
        const SMALL_SEGMENTS = [];
        let lastPoint = this.path.points[0];
        this.path.points.slice(1).forEach((point: Point) => {
            const LINE = new Line(lastPoint, point);
            if (LINE.translation.norm() < MIN_LINE_LENGTH) {
                SMALL_SEGMENTS.push(LINE);
            }
            lastPoint = point;
        });
        if (SMALL_SEGMENTS.length !== 0) {
            console.log('---SMALL SEGMENTS---', SMALL_SEGMENTS.length);
        }
        return SMALL_SEGMENTS;
    }

}

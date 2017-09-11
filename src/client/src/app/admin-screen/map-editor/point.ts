import { Drawable } from './drawable';

export class Point implements Drawable {
    public x: number;
    public y: number;
    public radius: number;
    public color: string;
    private context: CanvasRenderingContext2D;

    constructor(context: CanvasRenderingContext2D, x: number = 0, y: number = 0, radius: number = 10, color: string = 'blue') {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.context = context;
    }

    public draw(): void {
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.context.fillStyle = this.color;
        this.context.fill();
    }
}

import { Injectable } from '@angular/core';

import { MapEditorService } from '../map-editor.service';
import { Drawable } from './drawable';
import { MapPath } from './map-path';
import { Point } from '../point';
import { PointIndex } from '../point-index';

@Injectable()
export class MapRendererService implements Drawable {

    private canvasElement: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private path: MapPath;

    constructor(private mapEditor: MapEditorService) {
        this.path = new MapPath(this.context, []);
    }

    public set canvas(canvas: HTMLCanvasElement) {
        if (this.canvasElement === undefined) {
            this.canvasElement = canvas;
            this.context = this.canvasElement.getContext('2d');
            this.path = new MapPath(this.context, []);
        }
        else {
            throw new Error('Cannot change canvas once set.');
        }
    }

    public draw(): void {
        this.checkIfCanvasSet();
        this.clear();
        this.path.updatePoints(this.mapEditor.points);
        this.path.draw();
    }

    public moveCursorTo(coordinates: Point): void {
        this.checkIfCanvasSet();
        this.path.moveCursorTo(coordinates);
    }

    public get activePoint(): PointIndex {
        this.checkIfCanvasSet();
        return this.path.activePoint;
    }

    private clear(): void {
        this.checkIfCanvasSet();
        this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    }

    private checkIfCanvasSet(): void {
        if (this.canvasElement === undefined) {
            throw new Error('Invalid operation: canvas not set.');
        }
    }

}
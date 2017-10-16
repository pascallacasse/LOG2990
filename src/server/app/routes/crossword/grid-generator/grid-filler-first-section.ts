import { GridFiller } from './grid-filler';
import { GridGenerator } from './grid-generator';

export class GridFillerFirstSection extends GridFiller {

    constructor(grid: GridGenerator, isCommon: boolean) {
        super(grid, isCommon);
        this.firstWordLenght = [3, 6];
        this.secondWordLenght = [3, 4];
        this.thirdWordLenght = [3, 3];
        this.untilWhichRow = 3;
        this.acrossWordLenght = [[3, 9], [3, 3], [3, 3]];
    }

}

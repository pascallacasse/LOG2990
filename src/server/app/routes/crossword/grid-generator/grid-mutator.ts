import { AbstractGridGenerator } from './abstract-grid-generator';
import { Grid } from './grid';
import { Word } from '../word';
import { AbstractWordSuggestionsGetter } from './abstract-word-suggestions-getter';
import { Difficulty } from '../../../../../common/src/crossword/difficulty';

/**
 * @class GridMutator
 * @description Has the responsibility of generating a single mutated grid.
 * Unlike the GridGenerator, that we only need one instance of, multiple instances
 * of the mutator can exist, since we might want to stop the generation of a
 * mutated grid midway.
 *
 * You might say that this class is like a real-life factory that creates a single item.
 * At any time you can ask the factory to throw away the item that's being produced,
 * and then possibly ask to generate a new one instead.
 */
export class GridMutator extends AbstractGridGenerator {

    private difficulty: Difficulty;

    public get mutatedGrid(): Promise<Grid> {
        return this.latestGeneration;
    }

    constructor(difficulty: Difficulty) {
        super();
        this.difficulty = difficulty;
    }

    public mutateGrid(wordsToInclude: Word[]): Promise<Grid> {
        return this.gridGenerationBase(
            wordsToInclude,
            new AbstractWordSuggestionsGetter(this.difficulty)
        );
    }

    public cancelMutation(): Promise<void> {
        return this.cancelLatestGeneration();
    }

}
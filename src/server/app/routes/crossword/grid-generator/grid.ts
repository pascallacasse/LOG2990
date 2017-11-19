import { Word } from '../word';
import { GridFiller } from './grid-filler';
import { GridWord } from '../../../../../common/src/crossword/grid-word';
import { Direction, Owner } from '../../../../../common/src/crossword/crossword-enums';
import { Player } from '../player';

export class Grid {

    public static readonly DIMENSIONS = 10;

    public words: Word[] = [];

    constructor(wordsToInclude: Word[] = []) {
        this.words = wordsToInclude.slice();
    }

    public async fillUsing(filler: GridFiller): Promise<void> {
        await filler.fill(this);
    }

    public doesWordAlreadyExist(word: string): boolean {
        return this.words.findIndex((existingWord) => existingWord.value === word) >= 0;
    }

    public toGridWords(player: Player): GridWord[] {
        let horizontalId = 1, verticalId = 1;
        return this.words.map(word => {

            // ID of word
            let id: number;
            if (word.direction === Direction.horizontal) {
                id = horizontalId++;
            }
            else {
                id = verticalId++;
            }


            // Owner
            let owner: Owner;
            if (word.owner.equals(Player.NO_PLAYER)) {
                owner = Owner.none;
            }
            else if (word.owner.equals(player)) {
                owner = Owner.player;
            }
            else {
                owner = Owner.opponent;
            }

            return new GridWord(
                id,
                word.position.row,
                word.position.column,
                word.value.length,
                word.direction,
                owner,
                word.value
            );
        });
    }

    public toString(): string {
        const DATA: string[][] = [];

        // Fill DATA to be DIMENSIONS x DIMENSIONS
        for (let i = 0; i < Grid.DIMENSIONS; ++i) {
            DATA.push([]);
            for (let j = 0; j < Grid.DIMENSIONS; ++j) {
                DATA[i].push('');
            }
        }

        // Populate DATA with characters of all words
        this.words.forEach((word) => {
            if (word.direction === Direction.horizontal) {
                for (let i = 0; i < word.value.length; ++i) {
                    const ROW = word.position.row;
                    const COLUMN = word.position.column + i;
                    DATA[ROW][COLUMN] = word.value.charAt(i);
                }
            }
            else {
                for (let i = 0; i < word.value.length; ++i) {
                    const ROW = word.position.row + i;
                    const COLUMN = word.position.column;
                    DATA[ROW][COLUMN] = word.value.charAt(i);
                }
            }
        });

        // Produce string
        let string = '';
        DATA.forEach((line, lineIndex) => {
            if (lineIndex !== 0) {
                string += '\n';
            }
            line.forEach((character, columnIndex) => {
                if (columnIndex !== 0) {
                    string += ' ';
                }
                if (character !== '') {
                    string += character;
                }
                else {
                    string += '-';
                }
            });
        });

        return string;
    }

}

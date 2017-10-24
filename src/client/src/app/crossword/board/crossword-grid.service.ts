import { Injectable } from '@angular/core';
import { GridWord } from '../../../../../common/src/crossword/grid-word';
import { Direction } from '../../../../../common/src/crossword/crossword-enums';
import { ARRAY_GRIDWORD_H, ARRAY_GRIDWORD_V } from '../mocks/grid-mock';
import { CrosswordGameService } from '../crossword-game.service';
import { PacketManagerClient } from '../../packet-manager-client';
import { registerHandlers, PacketHandler, PacketEvent } from '../../../../../common/src/index';
import { WordTryPacket } from '../../../../../common/src/crossword/packets/word-try.packet';
import '../../../../../common/src/crossword/packets/word-try.parser';
import { DefinitionsService } from '../definition-field/definitions.service';
import { GridWordPacket } from '../../../../../common/src/crossword/packets/grid-word.packet';

import '../../../../../common/src/crossword/packets/grid-word.parser';

@Injectable()
export class CrosswordGridService {
    public crosswordGrid: string[][];
    public wordIsFound = false;
    public horizontalGridWords: Map<number, GridWord>;
    public verticalGridWords: Map<number, GridWord>;
    private viewableGrid: string[][];

    constructor(private crosswordGameService: CrosswordGameService, private packetManager: PacketManagerClient,
        private definitionsService: DefinitionsService) {
        registerHandlers(this, packetManager);

        // This mock is meant to stay as an initial view
        this.horizontalGridWords = new Map(ARRAY_GRIDWORD_H.map(
            (value: GridWord, index: number) => <[number, GridWord]>[index, value]));
        this.verticalGridWords = new Map(ARRAY_GRIDWORD_V.map(
            (value: GridWord, index: number) => <[number, GridWord]>[index, value]));
        this.fillAll();
    }

    public getViewableGrid(): string[][] {
        const CROSSWORD = this.viewableGrid;
        return CROSSWORD;
    }

    public fillAll() {
        this.fill();

        for (let i = 0; i < this.horizontalGridWords.size; i++) {
            this.fillHorizontal(this.horizontalGridWords.get(i));
        }

        for (let i = 0; i < this.verticalGridWords.size; i++) {
            this.fillVertical(this.verticalGridWords.get(i));
        }
    }

    public fillHorizontal(gridWord: GridWord): void {
        for (let i = 0; i < gridWord.length; i++) {
            this.viewableGrid[gridWord.y][i + gridWord.x] = '';
        }
    }

    public fillVertical(gridWord: GridWord): void {
        for (let i = 0; i < gridWord.length; i++) {
            this.viewableGrid[i + gridWord.y][gridWord.x] = '';
        }
    }

    public fillAcrossAndVertical(gridWord: GridWord) { // (y,x,length,direction,owner,string)
        if (gridWord.direction === Direction.horizontal) {
            for (let i = 0; i < gridWord.length; i++) {
                this.viewableGrid[gridWord.y][i + gridWord.x] = '';
            }
        }
        else if (gridWord.direction === Direction.vertical) {
            for (let i = 0; i < gridWord.length; i++) {
                this.viewableGrid[i + gridWord.y][gridWord.x] = '';
            }
        }
    }

    public fill() {
        this.viewableGrid = [
            ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
            ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
            ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
            ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
            ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
            ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
            ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
            ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
            ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
            ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0']
        ];
    }

    public stripSymbols(input) {
        return input.replace(/[^a-zA-Z]/g, '');
    }

    public onInputChange(input: string, word: GridWord) {
        if (this.crosswordGameService.aDefinitionIsSelected) {
            if (input.length < word.length) {
                this.inputLettersOnGrid(word, input);
            }
            else if (input.length === word.length) {
                this.inputLettersOnGrid(word, input);
                this.sendWordToServer(input, word);
                this.definitionsService.selectedDefinitionId = -1;


                // this.definitionsService.internalSelectedDefinitionId = -1;
                this.crosswordGameService.aDefinitionIsSelected = false;
            }
        }
    }

    public inputLettersOnGrid(word: GridWord, input: string) {
        for (let i = 0; i < word.length; i++) {
            if (word.direction === Direction.horizontal) {
                if (i < input.length) {
                    this.crosswordGrid[word.y][word.x + i] = input[i];
                }
                else {
                    this.crosswordGrid[word.y][word.x + i] = '';
                }
            }
            else if (word.direction === Direction.vertical) {
                if (i < input.length) {
                    this.crosswordGrid[word.y + i][word.x] = input[i];
                }
                else {
                    this.crosswordGrid[word.y + i][word.x] = '';
                }
            }
        }
    }

    public clearGridOfUselessLetters(): void {
        const words = [...this.horizontalGridWords.values(), ...this.verticalGridWords.values()];

        for (let i = 0; i < words.length; i++) {
            if (words[i].string === '') {
                this.inputLettersOnGrid(words[i], '');
            }
        }
    }

    public sendWordToServer(input: string, word: GridWord) {
        const newGridWord = Object.assign(new GridWord, word);
        newGridWord.string = input;

        // console.log('word try is :' + newGridWord);
        this.packetManager.sendPacket(WordTryPacket, new WordTryPacket(newGridWord));
    }

    @PacketHandler(WordTryPacket)
    public isTheRightAnswer(event: PacketEvent<WordTryPacket>) {
        if (event.value.wordTry.string !== '') {
            this.wordIsFound = true;
        }
        else {
            this.wordIsFound = false;
        }
    }

    @PacketHandler(GridWordPacket)
    public updateGridWord(event: PacketEvent<GridWordPacket>) {
        console.log('new gridword received from server: ' + JSON.stringify(event.value.gridword));
        // send change to grid
    }
}

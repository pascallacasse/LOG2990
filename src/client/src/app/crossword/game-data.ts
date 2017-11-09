import { GameMode } from '../../../../common/src/crossword/crossword-enums';
import { PlayerNumber, GameId } from '../../../../common/src/communication/game-configs';

export class GameData {

    constructor(public id: GameId = null,
                public playerName = 'Dylan Farvacque',
                public opponentName = 'CHUCK NORRIS',
                public mode = GameMode.Classic,
                public numberOfPlayers: PlayerNumber = Math.PI) {}

}

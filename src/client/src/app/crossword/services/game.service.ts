import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { UserDisplayableGameData } from '../config-menu/available-games/user-displayable-game-data';
import { Logger } from '../../../../../common/src/index';
import { CrosswordGameConfigs } from '../../../../../common/src/communication/game-configs';

@Injectable()
export class GameService {

    private static readonly BASE_URL = 'http://localhost:3000/crossword/games';
    private logger = Logger.getLogger('GameService');

    constructor(private http: HttpClient) { }

    public getGames(): Promise<UserDisplayableGameData[]> {
        const url = GameService.BASE_URL;
        const promise =
            this.http.get<CrosswordGameConfigs[]>(url).toPromise()
                .then((configs) => {
                    const twoPlayerGames = configs.filter((config) => config.playerNumber === 2);
                    return twoPlayerGames.map(
                        (config) => new UserDisplayableGameData(config.gameId, config.gameMode, config.difficulty)
                    );
                });
        return promise;
    }

}

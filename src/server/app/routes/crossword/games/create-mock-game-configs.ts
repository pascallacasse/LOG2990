import { CrosswordGameConfigs, PlayerNumber } from '../../../../../common/src/communication/game-configs';
import { Difficulty, GameMode } from '../../../../../common/src/crossword/crossword-enums';

export function createMockGameConfigs(): CrosswordGameConfigs {
    const gameModes = [GameMode.Classic, GameMode.Dynamic];
    const playerNumbers: PlayerNumber[] = [1, 2];
    const difficulties = [Difficulty.easy, Difficulty.medium, Difficulty.hard];

    const randGameMode = gameModes[Math.floor(Math.random() * gameModes.length)];
    const randPlayerNumber = playerNumbers[Math.floor(Math.random() * playerNumbers.length)];
    const randDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

    const config: CrosswordGameConfigs = {
        gameMode: randGameMode,
        playerNumber: randPlayerNumber,
        difficulty: randDifficulty,
        gameId: -1
    };
    return config;
}

export interface userState {
    id: number;
    name:string;
    avatar:string;
    exp: number;
    auth:boolean;
    number: number,
    gamesPlayed:number;
    avgGameScore:number;
    online:boolean;
    role: string;
}

export enum userActionTypes {
    CHANGE_NAME = 'CHANGE_NAME',
    CHANGE_EXP = 'CHANGE_EXP',
    CHANGE_AUTH = 'CHANGE_AUTH',
    CHANGE_GAMES_PLAYED = 'CHANGE_GAMES_PLAYED',
    CHANGE_AVG_GAME_SCORE = 'CHANGE_AVG_GAME_SCORE',
    SET_USER = 'SET_USER'
}
// SET USER ALL
interface ChangeName {
    type: userActionTypes.CHANGE_NAME
    payload: string;
}

interface ChangeExp {
    type: userActionTypes.CHANGE_EXP
    payload: number;
}

interface ChangeAuth {
    type: userActionTypes.CHANGE_AUTH
    payload: boolean;
}

interface ChangeGamesPlayed {
    type: userActionTypes.CHANGE_GAMES_PLAYED
    payload: number;
}

interface changeAvgGameScore {
    type: userActionTypes.CHANGE_AVG_GAME_SCORE
    payload: number;
}

interface setUser {
    type: userActionTypes.SET_USER
    payload: userState;
}


export type userAction = setUser | ChangeName | ChangeExp | ChangeGamesPlayed | ChangeAuth | changeAvgGameScore
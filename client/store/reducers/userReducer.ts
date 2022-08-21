import { userState, userActionTypes, userAction } from "../../types/user"

const initialState : userState = {
    id: 0,
    name: 'user',
    number: 2563,
    auth: false,
    exp: 0,
    gamesPlayed: 0,
    avgGameScore: 0,
    avatar: 'UserNoImage.png',
    online: false,
    role: 'USER',
}

// ТУТ ВСЁ НЕПРАВИЛЬНО, ДОЛЖНО ИДТИ В ОТДЕЛЬНЫЕ ФАЙЛЫ


export const user = (state = initialState, action : userAction) : userState => {
    switch(action.type) {
        case userActionTypes.CHANGE_AUTH:
            return {...state, auth:action.payload}
        case userActionTypes.CHANGE_AVG_GAME_SCORE:
            return {...state, avgGameScore: action.payload}
        case userActionTypes.CHANGE_EXP:
            return {...state, exp: action.payload}
        case userActionTypes.CHANGE_GAMES_PLAYED:
            return {...state, gamesPlayed: action.payload}
        case userActionTypes.CHANGE_NAME:
            return {...state, name: action.payload}
        case userActionTypes.SET_USER:
            return {...state, auth: true, id: action.payload.id, name:action.payload.name, exp: action.payload.exp, number: action.payload.number, avgGameScore: action.payload.avgGameScore, gamesPlayed: action.payload.gamesPlayed, online: true}
        default:
            return state
    }
}
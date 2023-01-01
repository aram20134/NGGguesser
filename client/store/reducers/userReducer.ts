import { userState, userActionTypes, userAction } from "../../types/user"

const initialState : userState = {
    id: 0,
    name: 'user',
    number: 0,
    level: 0,
    auth: false,
    exp: 0,
    avatar: 'UserNoImage.png',
    role: 'USER',
    updatedAt: '0',
    createdAt: '0',
}

export const user = (state = initialState, action : userAction) : userState => {
    switch(action.type) {
        case userActionTypes.CHANGE_AUTH:
            return {...state, auth:action.payload}
        case userActionTypes.CHANGE_EXP:
            return {...state, exp: action.payload}
        case userActionTypes.CHANGE_NAME:
            return {...state, name: action.payload}
        case userActionTypes.SET_USER:
            // console.log(action.payload)
            return {...state, ...action.payload, auth: true}
        default:
            return state
    }
}
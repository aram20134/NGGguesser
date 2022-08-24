import {combineReducers} from 'redux'
import {HYDRATE} from "next-redux-wrapper";
import { user } from './userReducer';
import { map } from './mapReducer';
import { socket } from './socketReducer';

const rootReducer = combineReducers({
    user: user,
    map: map,
    socket: socket,
})

export const reducer = (state: any, action: any) => {
    if (action.type === HYDRATE) {
        const nextState = {
            ...state, // use previous state
            ...action.payload, // apply delta from hydration
        }
        if (state.count) nextState.count = state.count // preserve count value on client side navigation
        return nextState
    } else {
        return rootReducer(state, action)
    }
}

export type RootState = ReturnType<typeof rootReducer>
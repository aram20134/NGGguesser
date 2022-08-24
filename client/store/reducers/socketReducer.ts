import { socketAction, socketActionTypes, socketState } from "../../types/socket"

const initialState = {
    sockets: []
}

export const socket = (state = initialState, action : socketAction) : socketState => {
    switch(action.type) {
        case socketActionTypes.SET_SOCKETS:
            return {...state, sockets: action.payload.sockets}
        default:
            return state
    }
}
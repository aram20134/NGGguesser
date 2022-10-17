import { socketAction, socketActionTypes, socketState } from "../../types/socket"
import { Socket } from "socket.io-client";

const initialState = {
    sockets: [],
    socket: {
        id: "",
        connected: false
    }
}

export const socket = (state = initialState, action : socketAction) : socketState => {
    switch(action.type) {
        case socketActionTypes.SET_SOCKETS:
            return {...state, sockets: action.payload.sockets, socket: action.payload.socket}
        default:
            return state
    }
}
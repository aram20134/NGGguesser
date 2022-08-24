import { socketAction, socketActionTypes, socketState } from "../../types/socket"


export const setSocket = (payload : socketState) : socketAction => {
    return {type: socketActionTypes.SET_SOCKETS, payload}
}
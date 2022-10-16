import { socketAction, socketActionTypes, socketState } from "../../types/socket"


export const setSockets = (payload : socketState) : socketAction => {
    return {type: socketActionTypes.SET_SOCKETS, payload}
}
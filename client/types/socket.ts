import { userState } from "./user";
import { Socket } from "socket.io-client";

export interface socketState {
    sockets?: Isockets[]
    socket?: Isocket
}

interface Isockets {
    id: number;
    user: userState;
}

interface Isocket {
    id: string;
}

export enum socketActionTypes {
    SET_SOCKETS = 'SET_SOCKETS'
}

interface setSockets {
    type: socketActionTypes.SET_SOCKETS
    payload: socketState;
}

export type socketAction = setSockets;
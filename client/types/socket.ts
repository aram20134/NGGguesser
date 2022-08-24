export interface socketState {
    sockets: Isockets[]
}

interface Isockets {
    id: number;
    socket: string;
}

export enum socketActionTypes {
    SET_SOCKETS = 'SET_SOCKETS'
}

interface setSockets {
    type: socketActionTypes.SET_SOCKETS
    payload: socketState;
}

export type socketAction = setSockets;
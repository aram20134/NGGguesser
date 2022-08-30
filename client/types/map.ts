export interface mapState {
    maps: Imap[];
}

export interface Imap {
    id: number;
    difficult: string;
    description: string;
    image: string;
    phase: number;
    name: string;
    mapSchema: string;
    likes: Ilikes[],
    userMapPlaydes: [],
    variantMaps: IvariantMaps[],
}

export interface Ilikes {
    id: number;
    mapId: number;
    userId: number;
}

export interface IvariantMaps {
    id: number;
    image: string;
    name: string;
    posX: number;
    posY: number;
    mapId: number;
}

export enum mapActionTypes {
    SET_MAPS = 'SET_MAPS'
}

interface setMaps {
    type: mapActionTypes.SET_MAPS
    payload: mapState;
}

export type mapAction = setMaps;
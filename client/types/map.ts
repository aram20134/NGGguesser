export interface mapState {
    maps: Imap[];
}

interface Imap {
    id: number;
    difficult: string;
    description: string;
    image: string;
    phase: number;
    name: string;
    likes: [],
    userMapPlaydes: [],
    variantMaps: [],
}

export enum mapActionTypes {
    SET_MAPS = 'SET_MAPS'
}

interface setMaps {
    type: mapActionTypes.SET_MAPS
    payload: mapState;
}

export type mapAction = setMaps;
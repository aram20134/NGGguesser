import { Ilikes, IuserMapPlayeds } from "./map";

export interface userState {
    id: number;
    name:string;
    avatar:string;
    exp: number;
    auth:boolean;
    number: number,
    userMapPlayeds?: IuserMapPlayeds[];
    level: number;
    role: string;
    updatedAt: string;
    createdAt: string;
}

export enum userActionTypes {
    CHANGE_NAME = 'CHANGE_NAME',
    CHANGE_EXP = 'CHANGE_EXP',
    CHANGE_AUTH = 'CHANGE_AUTH',
    SET_USER = 'SET_USER',
}

interface ChangeName {
    type: userActionTypes.CHANGE_NAME
    payload: string;
}

interface ChangeExp {
    type: userActionTypes.CHANGE_EXP
    payload: number;
}

interface ChangeAuth {
    type: userActionTypes.CHANGE_AUTH
    payload: boolean;
}

interface setUser {
    type: userActionTypes.SET_USER
    payload: userState;
}


export type userAction = setUser | ChangeName | ChangeExp  | ChangeAuth
import jwt_decode from 'jwt-decode';
import { authHost, host } from '.';
import { setCookie } from 'cookies-next';

export const getMaps = async () => {
    const {data} = await host.get('api/map/get')
    return data
}

export const setLike = async ({mapId}) => {
    const {data} = await authHost.post('api/map/like', {mapId})
    return data
}

export const delLike = async ({mapId}) => {
    const {data} = await authHost.post('api/map/likeDel', {mapId})
    return data
}

export const UserMapPlayed = async ({score, mapId}) => {
    const {data} = await authHost.post('api/map/addUserMapPlayed', {score, mapId})
    return data
}

export const GetUserMapPlayed = async (userId : number) => {
    const {data} = await authHost.post('api/map/getUserMapPlayed', {userId})
    return data
}

export const getHighscore = async (mapId : number) => {
    const {data} = await host.get(`api/map/highscore/${mapId}`)
    return data
}

export const findMap = async (name : string) => {
    const {data} = await host.get(`api/map/findMap/${name}`)
    return data
}
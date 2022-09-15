import jwt_decode from 'jwt-decode';
import { authHost, host } from '.';
import { setCookie } from 'cookies-next';

export const reg = async (name : string, password : string) => {
    return await host.post('api/user/reg', {name, password})
}   

export const log = async (name : string, password : string) => {
    const {data} = await host.post('api/user/log', {name, password})
    setCookie('token', data.token, {maxAge:172800 * 2}) // 96 h == 4 days
    return jwt_decode(data.token)
}

export const usersCount = async () => {
    const {data} = await host.get('api/user/userscount')
    return data
}

export const getUserByName = async (name : string) => {
    const {data} = await host.post('api/user/userbyname', {name})
    return data
}

export const users = async () => {
    const {data} = await host.get('api/user/users')
    return data
}

export const getUserLikes = async (userId : number) => {
    const {data} = await host.post('api/user/userlikes', {userId})
    return data
}

export const getUserActivity = async (userId : number) => {
    const {data} = await host.post('api/user/useractivity', {userId})
    return data
}

export const checkUser = async () => {
    const {data} = await authHost.get('api/user/check')
    setCookie('token', data.token, {maxAge:172800 * 2}) // 96 h == 4 days
    return jwt_decode(data.token)
}
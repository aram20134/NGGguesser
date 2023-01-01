import jwt_decode from 'jwt-decode';
import { authHost, host, localHost } from '.';
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
    const {data} = await localHost.get('api/user/userscount')
    return data
}

export const getUserByName = async (name : string) => {
    const {data} = await host.post('api/user/userbyname', {name})
    return data
}

export const findUser = async (userId?, name?) => {
    const {data} = await host.post('api/user/findUser', {userId, name})
    return data
}

export const findUserServer = async (userId?, name?) => {
    const {data} = await localHost.post('api/user/findUser', {userId, name})
    return data
}

export const getUserLikesServer = async (userId : number) => {
    const {data} = await localHost.post('api/user/userlikes', {userId})
    return data
}

export const getUserActivityServer = async (userId : number) => {
    const {data} = await localHost.post('api/user/useractivity', {userId})
    return data
}

export const checkUser = async () => {
    const {data} = await authHost.get('api/user/check')
    setCookie('token', data.token, {maxAge:172800 * 2}) // 96 h == 4 days
    return jwt_decode(data.token)
}

export const addExp = async (exp : number) => {
    const {data} = await authHost.post('api/user/exp', {exp})
    return data
}

export const getAllUsersServer = async () => {
    const {data} = await localHost.get('api/user')
    return data
}

export const searchUsers = async (search) => {
    const {data} = await host.get('api/user/searchUsers', {
        params: {
            search
        }
    })
    return data
}

export const addFriend = async ({friendId}) => {
    const {data} = await authHost.post('api/user/addFriend', {friendId})
    return data
}
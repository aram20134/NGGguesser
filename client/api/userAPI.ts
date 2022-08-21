import jwt_decode from 'jwt-decode';
import { authHost, host } from '.';
import { setCookie } from 'cookies-next';

export const reg = async (name : string, password : string) => {
    const {data} = await host.post('api/user/reg', {name, password})
    return jwt_decode(data.token)
}   

export const log = async (name : string, password : string) => {
    const {data} = await host.post('api/user/log', {name, password})
    setCookie('token', data.token)
    return jwt_decode(data.token)
}

export const users = async () => {
    const {data} = await host.get('api/user/users')
    return data
}

export const userOnline = async (state : boolean) => {
    authHost.post('api/user/state', {state})
}

export const checkUser = async () => {
    const {data} = await authHost.get('api/user/check' )
    // localStorage.setItem('token', data.token)
    setCookie('token', data.token)
    return jwt_decode(data.token)
}
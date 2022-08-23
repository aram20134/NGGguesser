import jwt_decode from 'jwt-decode';
import { authHost, host } from '.';
import { setCookie } from 'cookies-next';

export const getMaps = async () => {
    const {data} = await host.get('api/map/get')
    return data
}   
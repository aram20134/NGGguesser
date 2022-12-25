import jwt_decode from 'jwt-decode';
import { authHost, host } from '.';

export const changeVariantMap = async ({id, posX, posY, mapId}) => {
    const {data} = await authHost.post('api/admin/changeVariantMap', {id, posX, posY, mapId})
    return data
}
import jwt_decode from 'jwt-decode';
import { authHost, host } from '.';

export const changeVariantMap = async ({id, posX, posY, mapId, active}) => {
    const {data} = await authHost.post('api/admin/changeVariantMap', {id, posX, posY, mapId, active})
    return data
}

export const changeMap = async ({id, active}) => {
    const {data} = await authHost.post('api/admin/changeMap', {id, active})
    return data
}

export const addVariantMap = async (variant : FormData, setLoading : Function) => {
    const {data} = await authHost.post('api/admin/addVariantMap', variant, {
        onUploadProgress: (progressEvent : ProgressEvent) => {
            setLoading((progressEvent.loaded * 100) / progressEvent.total)
            console.log((progressEvent.loaded * 100) / progressEvent.total)
        },
    })
    return data
}

export const deleteVariantMap = async ({id}) => {
    const {data} = await authHost.post('api/admin/deleteVariantMap', {id})
    return data
}
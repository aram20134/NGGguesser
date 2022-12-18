import { mapAction, mapActionTypes } from "../../types/map"
import { mapState } from './../../types/map';
import { Dispatch } from 'react';
import { getMaps } from './../../api/mapAPI';

export const setMaps = () => {
    return async (dispatch : Dispatch<mapAction>) => {
        try {
            const response : mapState = await getMaps()
            dispatch({type: mapActionTypes.SET_MAPS, payload:response})
            return response
        } catch (e) {
            console.log(e);
        }
    }
}
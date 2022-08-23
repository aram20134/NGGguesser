import { mapAction, mapActionTypes } from "../../types/map"
import { mapState } from './../../types/map';
import { Dispatch } from 'react';
import { getMaps } from './../../api/mapAPI';


// export const setMap = (payload : mapState) : mapAction => {
//     return {type: mapActionTypes.SET_MAPS, payload}
// }

export const setMaps = () => {
    return async (dispatch : Dispatch<mapAction>) => {
        try {
            const response : mapState = await getMaps()
            dispatch({type: mapActionTypes.SET_MAPS, payload:response})
        } catch (e) {
            
        }
    }
}
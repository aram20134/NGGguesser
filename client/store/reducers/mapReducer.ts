import { mapState, mapAction, mapActionTypes } from './../../types/map';

const initialState : mapState = {
    maps: [{
        id: 0,
        difficult: '',
        description: '',
        image: '',
        name: '',
        likes: [],
        phase: 0,
        userMapPlayeds: [],
        variantMaps: [],
        mapSchema: ''
    }]
}

export const map = (state = initialState, action : mapAction) : mapState => {
    switch(action.type) {
        case mapActionTypes.SET_MAPS:
            return {...state, maps: action.payload.maps}
        default:
            return state
    }
}
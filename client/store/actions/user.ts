import { Dispatch } from "react"
import { checkUser } from "../../api/userAPI"
import { userAction, userActionTypes, userState } from "../../types/user"


export const setUser = (payload : userState) : userAction => {
    return {type: userActionTypes.SET_USER, payload}
}

export const ChangeName = (payload:string) : userAction => {
    return {type: userActionTypes.CHANGE_NAME, payload}
}

export const ChangeAuth = (payload:boolean) : userAction => {
    return {type: userActionTypes.CHANGE_AUTH, payload}
}

// export const setUserTest = () => {
//     return async (dispacth: Dispatch<userAction>) => {
//         checkUser().then((res : userState) => dispacth({type: userActionTypes.SET_USER, payload:res}))
//     }
// }
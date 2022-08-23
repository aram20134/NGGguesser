import { Dispatch } from "react"
import { host } from "../../api"
import { checkUser } from "../../api/userAPI"
import jwt_decode from 'jwt-decode';
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

export const setUserProps = (token) => {
    return async (dispacth: Dispatch<userAction>) => {
        try {
            const config = {
                headers: {
                    authorization: `Bearer ${token}`
                }
            }
            const {data} = await host.get('api/user/check', config)
            // console.log(response)
            // checkUser().then((res : userState) => dispacth({type: userActionTypes.SET_USER, payload: res}))
            // await checkUser().then((res) => console.log(res)).catch((e) => console.log(e))
            // const response = await checkUser()
            dispacth({type: userActionTypes.SET_USER, payload: jwt_decode(data.token)})
        } catch (e) {
            console.log(e.message)
            dispacth({type: userActionTypes.CHANGE_AUTH, payload: false})
        }
    }
}
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client";
import { useActions } from "./useActions";
import { useTypedSelector } from './useTypedSelector';


export const useSocket = () => {
    const {setSocket} = useActions()
    const [socketNew, setSocketNew] = useState<Socket>()


    useEffect(() => {
        if (getCookie('token')) {
            setSocketNew(io(process.env.REACT_APP_API_URL, {auth: {token : getCookie('token'), sessionID: localStorage.getItem('sessionID')}}))
        } else {
            setSocketNew(io(process.env.REACT_APP_API_URL, {query: {forOnline: true}}))
        }
    }, [])

    useEffect(() => {
        if (socketNew) {
            socketNew.on('connect', () => {
                socketNew.emit('USER_ONLINE')
            })
            console.log(socketNew);
            socketNew.on('SESSION', ({sessionID}) => {
                socketNew.auth = {...socketNew.auth, sessionID}
                localStorage.setItem('sessionID', sessionID)
            })
    
            socketNew.on('USERS_ONLINE', async (data) => {
                await setSocket({sockets: data})
            })
            return () => {
                socketNew.disconnect()
            }
        }
    }, [socketNew])
    
    return socketNew
}
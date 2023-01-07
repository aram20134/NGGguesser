import { getCookie } from "cookies-next";
import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client";
import { useActions } from "./useActions";

export const useSocket = () => {
    const {setSockets} = useActions()
    const [socketNew, setSocketNew] = useState<Socket>()


    useEffect(() => {
        if (getCookie('token')) {
            setSocketNew(io(process.env.REACT_APP_API_URL, {autoConnect: true, auth: {token : getCookie('token'), sessionID: localStorage.getItem('sessionID')}}))
        } else {
            setSocketNew(io(process.env.REACT_APP_API_URL, {query: {forOnline: true}}))
        }
    }, [])
        
        
    useEffect(() => {
        if (socketNew) {
            socketNew.on('connect', () => {
                console.log(socketNew);
                socketNew.emit('USER_ONLINE')
                setSockets({socket: socketNew})
            })  
            socketNew.on('SESSION', ({sessionID}) => {
                socketNew.auth = {...socketNew.auth, sessionID}
                localStorage.setItem('sessionID', sessionID)
            })
        
            socketNew.on('USERS_ONLINE', (data) => {
                setSockets({sockets: data, socket: socketNew})
                console.log(data);
            })
            socketNew.on('close', () => {
                setSockets({socket: {disconnected: true, id:"asd", connected:false}})
                socketNew.disconnect()
            })
            return () => {
                socketNew.disconnect()
            }
        }
    }, [socketNew])

    return socketNew
}
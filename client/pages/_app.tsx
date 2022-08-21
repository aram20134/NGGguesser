import '../styles/globals.css'
import React, {FC, useEffect} from 'react';
import {AppProps} from 'next/app';
import {wrapper} from '../store';
import { checkUser, userOnline } from '../api/userAPI';
import { userState } from '../types/user';
import { useActions } from './../hooks/useActions';
import { useState } from 'react';
import io from 'socket.io-client';
import { useTypedSelector } from './../hooks/useTypedSelector';
const socket = io('http://localhost:5003')

const WrappedApp: FC<AppProps> = ({Component, pageProps}) => {
    const {setUser} = useActions()
    const [loaded, setLoaded] = useState(false)
    const user = useTypedSelector(st => st.user)

    useEffect(() => {
        checkUser().then((res : userState) => {return setUser(res), userOnline(true)}).finally(() => setLoaded(true))
        
    }, [])

    useEffect(() => {
        if (user.name !== 'user') {
            socket.emit('USER_ONLINE', {userId: user.id})
        }
    }, [user])
    
    useEffect(() => {
        socket.on('USERS_ONLINE', (socket) => {
            console.log(socket);
        })
    }, [socket])
    
    
    if (!loaded) {
        return <h1 style={{color:'red'}}>загрузка</h1>
    }
    return (
        <Component {...pageProps} />
    )
}


export default wrapper.withRedux(WrappedApp);

import '../styles/globals.css'
import React, {FC, useEffect} from 'react';
import {AppProps} from 'next/app';
import {wrapper} from '../store';
import { checkUser } from '../api/userAPI';
import { userState } from '../types/user';
import { useActions } from './../hooks/useActions';
import { useState } from 'react';
import io from 'socket.io-client';
import { useTypedSelector } from './../hooks/useTypedSelector';
import { getCookie } from 'cookies-next';
import { setInterval } from 'timers';

var token
var socket


const WrappedApp: FC<AppProps> = ({Component, pageProps}) => {
    const {setUser} = useActions()
    const [loaded, setLoaded] = useState(false)
    const user = useTypedSelector(st => st.user)

    useEffect(() => {
        checkUser().then((res : userState) => {return setUser(res)}).finally(() => setLoaded(true))
    }, [])

    useEffect(() => {
        if (user.name !== 'user') {
            token = getCookie('token')
            socket = io(process.env.REACT_APP_API_URL, {auth: {token}})
            console.log(user);
        }
    }, [user])
    
    useEffect(() => {
        if (user.name !== 'user') {
            socket.on('connect', () => {
                socket.emit('USER_ONLINE')
            })
            socket.on('USERS_ONLINE', (data) => {
                console.log('data', data);
            })
            socket.on('disconnect', (data) => {
                console.log('diss')
            })
        }
    }, [socket])
    
    
    // if (!loaded) {
    //     return <h1 style={{color:'red'}}>загрузка</h1>
    // }

    return (
        <Component {...pageProps} />
    )
}


export default wrapper.withRedux(WrappedApp);

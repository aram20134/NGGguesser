import '../styles/globals.css'
import React, {FC, useEffect} from 'react';
import {AppProps} from 'next/app';
import {NextThunkDispatch, wrapper} from '../store';
import { checkUser } from '../api/userAPI';
import { userState } from '../types/user';
import { useActions } from './../hooks/useActions';
import { useState } from 'react';
import io from 'socket.io-client';
import { useTypedSelector } from './../hooks/useTypedSelector';
import { getCookie } from 'cookies-next';
import { Router, useRouter } from 'next/router';

var socket

const WrappedApp: FC<AppProps> = ({Component, pageProps}) => {
    const user = useTypedSelector(st => st.user)
    const {setSocket} = useActions()

    useEffect(() => {
        if (user.name !== 'user') {
            socket = io(process.env.REACT_APP_API_URL, {auth: {token: getCookie('token')}})
        }
    }, [user])
    
    useEffect(() => {
        if (user.name !== 'user') {
            socket.on('connect', () => {
                socket.emit('USER_ONLINE')
            })
            socket.on('USERS_ONLINE', (data) => {
                setSocket({sockets: data})
            })
        }
    }, [socket])

    return (
        <Component {...pageProps} />
    )
}


export default wrapper.withRedux(WrappedApp);


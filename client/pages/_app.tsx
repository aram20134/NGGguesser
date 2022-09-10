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
import { useDispatch } from 'react-redux';

const WrappedApp: FC<AppProps> = ({Component, pageProps}) => {
    return (
        <Component {...pageProps} />
    )
}


export default wrapper.withRedux(WrappedApp);


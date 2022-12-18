import '../styles/globals.css'
import {FC} from 'react';
import {AppProps} from 'next/app';
import {wrapper} from '../store';
import NextProgress from "next-progress";

const WrappedApp: FC<AppProps> = ({Component, pageProps}) => {
    
    return (
        <>
            <NextProgress delay={300} options={{ showSpinner: true }} />
            <Component {...pageProps} />
        </>
    )
}


export default wrapper.withRedux(WrappedApp);



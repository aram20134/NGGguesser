import React from 'react'
import Head from 'next/head';
import Navbar from './Navbar';
import ico from '../public/favicon/favicon.ico'
import Footer from './Footer';
import { checkUser } from '../api/userAPI';

interface MainContainerProps {
    title: string;
    children?: React.ReactNode;
}

const MainContainer: React.FC<MainContainerProps> = ({title, children}) => {
    return (
    <>
        <Head>
            <meta charSet='utf-8'></meta>
            {/* <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=yes"></meta> */}
            <meta httpEquiv="X-UA-Compatible" content="IE=edge"></meta>
            <meta name='description' content='SWRPGUESSER это игра, которая позволяет проверить свои навыки знания карт на серверах SWRP NGG.'></meta>
            <title>{title}</title>
            <link rel='shortcut icon' href={ico.src}></link>
        </Head>
        <header>
            <Navbar />
        </header>
        <>
            {children}
        </>
        <footer style={{marginTop:'5rem'}}>
            <Footer />
        </footer>
    </>
  )
}
export default MainContainer;
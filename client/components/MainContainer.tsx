import React, { useEffect, useState } from 'react'
import Head from 'next/head';
import Navbar from './Navbar';
import ico from '../public/favicon/favicon.ico'
import Footer from './Footer';
import { addFriend, checkUser, findUser } from '../api/userAPI';
import { useSocket } from './../hooks/useSocket';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { userState } from '../types/user';
import dynamic from 'next/dynamic';

const Modal = dynamic(() => import('../components/UI/Modal'))
const UserCard = dynamic(() => import('./UserCard'))

interface MainContainerProps {
    title: string;
    children?: React.ReactNode;
}

const MainContainer: React.FC<MainContainerProps> = ({title, children}) => {
    const [modalActive, setModalActive] = useState(false)
    const [addFriends, setAddFriends] = useState([])

    useSocket()

    const {socket} = useTypedSelector(st => st.socket) as any

    useEffect(() => {
        if (socket.connected) {
            socket.on('ADD_FRIEND', async (id) => {
                await findUser(id).then(async (friend) => {await setAddFriends(addFriends.filter((f) => f.id !== friend.id)), await setAddFriends(prev => [...prev, friend])}).finally(() => setModalActive(true))
            })
        }
    }, [socket])

    const handleClose = (friend) => {
        setAddFriends(addFriends.filter((f) => f.id !== friend.id))
    }

    const handleAddFriend = (friend) => {
        console.log(friend)
        addFriend({friendId: friend.id}).then(res => console.log(res))
    }
    
    return (
    <>
        <Head>
            <meta charSet='utf-8'></meta>
            {/* <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=yes"></meta> */}
            <meta httpEquiv="X-UA-Compatible" content="IE=edge"></meta>
            <meta name='description' content='NGG GUESSER это игра, которая позволяет проверить свои навыки знания карт на серверах SWRP NGG.'></meta>
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
            <div style={{display: addFriends.length ? 'flex' : 'none', position:'fixed', right: '0px', bottom:'0px', justifyContent:'flex-end', alignItems:'flex-end', flexDirection:'column', zIndex: '2', padding: '15px', gap: '15px'}}>
            {addFriends && addFriends.map((f) => 
            <Modal key={f} mini modalActive={modalActive} title='Приглашение в друзья' onSubmit={{name: 'Принять', action: () => handleAddFriend(f)}} onClose={{name: 'Отклонить', action: () => handleClose(f)}} >
                <UserCard user={f}  />
            </Modal>)
            }
            </div>
            <Footer />
        </footer>
    </>
  )
}
export default MainContainer;
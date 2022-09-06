import type { GetStaticProps, NextPage } from 'next'
import { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import MainContainer from '../components/MainContainer'
import { useActions } from './../hooks/useActions';
import { useTypedSelector } from './../hooks/useTypedSelector';
import Link from 'next/link';
import MyButton, { ButtonVariant } from './../components/UI/MyButton';
import anaxes from '../public/anaxes.png'
import cl1 from '../public/clone1.png'
import cl2 from '../public/clone2.png'
import medal from '../public/medal.png'
import MyButtonLink from '../components/UI/MyButtonLink';
import { users } from '../api/userAPI';
import Image from 'next/image';
import styles from '../styles/Index.module.scss'
import IndexAuth from '../components/IndexAuth';
import { GetServerSideProps } from 'next';
import {NextThunkDispatch, wrapper} from '../store';
import { setMaps } from '../store/actions/map';
import { getMaps } from './../api/mapAPI';
import { setUserProps } from '../store/actions/user';
import { io } from 'socket.io-client';
import { getCookie } from 'cookies-next';

interface IndexProps {
  users: number;
  test: any
}

const Index : NextPage<IndexProps> = ({users}) => {
  const user = useTypedSelector(st => st.user)
  const map = useTypedSelector(st => st.socket)
  const {setSocket} = useActions()

  

  useEffect(() => {
    if (getCookie('token')) {
      var socket = io(process.env.REACT_APP_API_URL, {auth: {token : getCookie('token')}})
      socket.auth = {...socket.auth, sessionID: localStorage.getItem('sessionID')}
    } else {
      var socket = io(process.env.REACT_APP_API_URL, {query: {forOnline: true}})
    }
    
    socket.on('connect', () => {
      socket.emit('USER_ONLINE')
    })

    socket.on('SESSION', ({sessionID}) => {
      socket.auth = {...socket.auth, sessionID}
      localStorage.setItem('sessionID', sessionID)
    })

    socket.on('USERS_ONLINE', async (data) => {
      await setSocket({sockets: data})
    })
    
    return () => {
      socket.disconnect()
    }
    
  }, [])
  

  return !user.auth ? (
    <MainContainer title='NGG GUESSER'>
      <div className={styles.background}>
        <div className={styles.background3}></div>
      </div>
      <div className={styles.background2}></div>
      <main className={styles.main}>
        <div>
          <h1>ИЗУЧАЙ КАРТЫ!</h1>
          <p>Покажи свои знания карт. <br /> Соревнуйся с другими игроками, чтобы доказать свои знания! </p>
          <p>С нами уже {users} игроков!</p>
        </div>
        <div>
            <MyButtonLink link='signup' variant={ButtonVariant.primary}>Играть</MyButtonLink>
        </div>
        <main className={styles.teasers}>
          <div className={styles.teaser}>
            <div>
              <h2>Изучай карты</h2>
              <p>Изучай карты в своём темпе и набирай как можно больше очков.</p>
            </div>
            <Image alt='anaxes' src={anaxes} priority />
          </div>
          <hr />
          <div className={styles.teaser}>
            <div style={{display:'flex', flexDirection:'row'}}>
              <img alt='clone phase1' className={styles.img2} src={cl1.src} />
              <img alt='clone phase2' className={styles.img2} src={cl2.src} />
            </div>
            <div>
              <h2>Играй с друзьями</h2>
              <p>Сорвенуйся против своих друзей. Докажи кто здесь лучший!</p>
            </div>
          </div>
          <hr />
          <div className={styles.teaser}>
            <div>
              <h2>Соревнуйся с другими</h2>
              <p>Проверь свои способности с разными игроками. Поднимайся по таблице! </p>
            </div>
            <Image alt='medal' src={medal} />
          </div>
        </main>
      </main>
    </MainContainer>
  ) : (
    <MainContainer title='NGG GUESSER'>
      <IndexAuth />
    </MainContainer>
  )
}

export default Index

export const getServerSideProps : GetServerSideProps = wrapper.getServerSideProps(store => async ({req, res}) => {
  const dispatch = store.dispatch as NextThunkDispatch

  // socket.emit('GET_USERS_ONLINE')
  // socket.on('USERS_ONLINE', async (data) => {
  //   test = data
  // })

  const response = await users()  
  await dispatch(setMaps())
  await dispatch(setUserProps(req.cookies.token))

  return {
    props: {users:response.users}
  }
})
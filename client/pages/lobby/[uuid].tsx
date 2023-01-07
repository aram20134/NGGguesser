import { GetServerSideProps } from "next"
import dynamic from "next/dynamic"
import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { findMapServer } from "../../api/mapAPI"
import { findUser, getFriends } from "../../api/userAPI"
import MainContainer from "../../components/MainContainer"
import Alert, { AlertVariant } from "../../components/UI/Alert"
import MyButton, { ButtonVariant } from "../../components/UI/MyButton"
import MyButtonLink from "../../components/UI/MyButtonLink"
import UserCard from "../../components/UserCard"
import { useTypedSelector } from "../../hooks/useTypedSelector"
import { NextThunkDispatch, wrapper } from "../../store"
import { setMaps } from "../../store/actions/map"
import { setUserProps } from "../../store/actions/user"
import styles from '../../styles/Lobby.module.scss'
import { Imap } from "../../types/map"
import { userState } from "../../types/user"
import Friends from "../profile/[name]/friends"

interface PlayWithFriendsProps {
  map: Imap;
}

const PlayWithFriends : React.FC<PlayWithFriendsProps> = ({map}) => {
  const router = useRouter()
  const {socket, sockets} = useTypedSelector(st => st.socket) as any
  const [friends, setFriends] = useState([])
  const [userFriends, setUserFriends] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [admin, setAdmin] = useState<userState>()
  const [ready, setReady] = useState(false)
  const [hostReady, setHostReady] = useState(false)
  const [modal, setModal] = useState(false)
  const [gameReadyStart, setGameReadyStart] = useState(false)
  const user = useTypedSelector(st => st.user)
  
  const Modal = dynamic(() => import('../../components/UI/Modal'))

  useEffect(() => {
    if (socket.connected) {
      socket.emit('LOBBY_FRIENDS', {room: router.query.uuid}, user)
      socket.on('LOBBY_FRIENDS', (userId, friend) => {
        !userId && router.push('/404')
        if (userId !== user.id) {
          findUser(userId).then((u) => {return setFriends(u), setAdmin(u)}).finally(() => setFriends(prev => [prev, ...friend])).finally(() => setLoaded(true))
        } else {
          setAdmin(user)
          setFriends(friend)
        }
      })
      socket.on('LOBBY_FRIENDS_READY', (allFriends, hostReady) => {
        setHostReady(hostReady)
        setFriends(allFriends)
      })
      socket.on('LOBBY_FRIENDS_START_GAME', (roomGame) => {
        router.push(`/playWithFriends/${roomGame}?map=${map.name}`)
      })
    }
  }, [socket])

  const leaveGame = () => {
    socket.emit('LOBBY_FRIENDS_LEAVE', router.query.uuid, user)
    router.push('/')
  }
  
  useEffect(() => {
    setLoaded(true)
    friends.map((f) => f.id === user.id && setReady(f.ready))
    if (friends.every((f) => f.ready) && hostReady) {
      setGameReadyStart(true)
    } else {
      setGameReadyStart(false)
    }
    getFriends().then(res => setUserFriends(res))
  }, [friends])
  
  const handleReady = () => {
    if (socket.connected) {
      setReady(!ready)
      socket.emit('LOBBY_FRIENDS_READY', router.query.uuid, user, !ready)
    }
  }

  const handleStartGame = () => {
    if (gameReadyStart) {
      socket.emit('LOBBY_FRIENDS_START_GAME', router.query.uuid, map.id)
    }
  }
  
  return (
      <MainContainer title={`Лобби ${map.name}`}>
        <div className={styles.bg}></div>
        <main className={styles.lobby}>
          <h1>Пригласите друзей перед игрой на {map.name}</h1>
          <div className={styles.container}>
            <div className={styles.leftSide}>
              <div className={styles.map}>
                <Image src={`${process.env.REACT_APP_API_URL}/map/${map.image}`} width='150px' height='150px' />
                <h2>{map.name}</h2>
                <div style={{maxWidth: '500px', textAlign: 'center'}}>{map.description}</div>
              </div>
              <div className={styles.buttons}>
                {!ready ? <MyButton myStyle={{width:'100%'}} variant={ButtonVariant.primary} click={handleReady}>Готов</MyButton> : <MyButton myStyle={{width:'100%'}} variant={ButtonVariant.primary} click={handleReady}>Не готов</MyButton>}
                <MyButton myStyle={{width:'100%'}} variant={ButtonVariant.outlined} click={() => leaveGame()}>Выйти</MyButton>
              </div>
            </div>
            <div className={styles.users}>
              {loaded ? (
                <>
                  {admin?.id === user.id && 
                  <>
                    <h2>Хост</h2>
                    <UserCard ready={ready} user={user} />
                    <hr />
                  </>}
                  {friends.length && admin?.id !== user.id && 
                  <>
                    <h2>Хост</h2>
                    <UserCard ready={hostReady} user={admin} />
                    <hr />
                  </>}
                  {friends && friends.map((f) => f.id !== admin?.id && <UserCard ready={f.ready} key={f.id} user={f} />)}
                  <div onClick={() => setModal(true)} className={styles.inviteFriend}>
                    Пригласить друга + 
                  </div>
                  <Modal title="Друзья" modalActive={modal} onClose={{name: 'Закрыть', action: () => setModal(false)}}>
                    {userFriends.map(f => <UserCard map={map} key={f.id} invite user={f} />)}
                  </Modal>
                </>
              ) : (
                <div className="loader"></div>
              )}
            </div>
          </div>
            <Alert myStyle={{maxWidth:'1200px'}} variant={AlertVariant.warning} title='Внимание'>Данный режим находиться в разработке. Возможны присутствия багов и проблем. <br /> <br /> <b>Для приглашения друга используйте ссылку на эту страницу: {`https://swrpngg.ru/${router.asPath}`}</b> </Alert>
            {admin?.id === user.id && <MyButton disabled={!gameReadyStart} click={handleStartGame} myStyle={{width:'100%', maxWidth:'1200px'}} variant={gameReadyStart ? ButtonVariant.primary : ButtonVariant.outlined}>{gameReadyStart ? 'Начать игру' : 'Не все игроки готовы'}</MyButton>}
        </main>
      </MainContainer>
  )
}

export default PlayWithFriends


export const getServerSideProps : GetServerSideProps = wrapper.getServerSideProps(store => async ({req, res, query}) => {
  const dispatch = store.dispatch as NextThunkDispatch

  await dispatch(setMaps())
  await dispatch(setUserProps(req.cookies.token))
  var {user} = store.getState()
  const {map} = await findMapServer(query.map.toString())

  if (!user.auth) {
    return {
      redirect: {destination: '/signin', permanent: true}
    }
  }
  if (!map) {
    return {
      redirect: {destination: '/404', permanent: true}
    }
  }
  
  return {
    props: {map}
  }
})
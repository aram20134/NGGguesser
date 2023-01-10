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
import UserCard from "../../components/UserCard"
import { useTypedSelector } from "../../hooks/useTypedSelector"
import { NextThunkDispatch, wrapper } from "../../store"
import { setMaps } from "../../store/actions/map"
import { setUserProps } from "../../store/actions/user"
import styles from '../../styles/Lobby.module.scss'
import { Imap } from "../../types/map"
import { userState } from "../../types/user"

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
  const [copied, setCopied] = useState(false)
  const [hostReady, setHostReady] = useState(false)
  const [friendsLoaded, setFriendsLoaded] = useState(false)
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
    getFriends().then(res => setUserFriends(res)).finally(() => setFriendsLoaded(true))
  }, [friends])
  
  const handleReady = () => {
    if (socket.connected) {
      setReady(!ready)
      socket.emit('LOBBY_FRIENDS_READY', router.query.uuid, user, !ready)
    }
  }

  useEffect(() => {
    if (copied) {
      var timer = setTimeout(() => {
        setCopied(false)
      }, 1000);
    }
    return () => clearTimeout(timer)
  }, [copied])
  

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
                  {friends.length && admin?.id !== user.id ?
                  <>
                    <h2>Хост</h2>
                    <UserCard ready={hostReady} user={admin} />
                    <hr />
                  </> : ''}
                  {friends && friends.map((f) => f.id !== admin?.id && <UserCard ready={f.ready} key={f.id} user={f} />)}
                  {admin?.id === user.id && <div onClick={() => setModal(true)} className={styles.inviteFriend}>
                    Пригласить друга + 
                  </div>}
                  {admin?.id === user.id && 
                  <div style={copied ? {background: 'green'} : {}} onClick={() => {navigator.clipboard.writeText(`${document.URL}`), setCopied(true)}} className={styles.inviteFriend}>
                    {copied ? 'Скопировано!' : 'Поделиться ссылкой'}
                  </div>}
                  <Modal title="Пригласить в игру" modalActive={modal} onClose={{name: 'Закрыть', action: () => setModal(false)}}>
                    {friendsLoaded ? (
                      userFriends.map(f => <UserCard map={map} key={f.id} invite user={f} />)
                    ) : ( 
                      <div className="loader"></div>
                    )}
                    {userFriends.length === 0 && <h3>У вас пока нет друзей</h3>}
                  </Modal>
                </>
              ) : (
                <div className="loader"></div>
              )}
            </div>
          </div>
            <Alert myStyle={{maxWidth:'1200px'}} title="Об игре с друзьями" variant={AlertVariant.success}>
              Данный режим представляет собой игру с вашими друзьями. <br /><br />
              <h3>Основные моменты:</h3>
              <b>1.</b> У каждого игрока собственный счёт и собственный таймер. Ваш счёт и время не зависят от вашего интернета или компьютера. <br />
              <b>2.</b> Конечная позиция видна только тогда, когда каждый игрок выберет позицию. <br />
              <b>3.</b> Раунды меняются после выбора позиций всеми игроками. Сменяемость раунда производится хостом. <br />
              <b>4.</b> В случае выхода из игры одного из участников, игра не может быть продолжена, пока покинувший игрок не вернётся и не сделает ход. <br />
              <b>5.</b> В случае паузы, игра сохраняется в списке игр в профиле. Игра автоматически удалится после 2-ух дней после старта игры.
            </Alert>
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
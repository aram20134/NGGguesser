import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { Viewer } from "photo-sphere-viewer"
import { useEffect, useState } from "react"
import { findMapServer } from "../../api/mapAPI"
import { findUser } from "../../api/userAPI"
import MainContainer from "../../components/MainContainer"
import PositionPickerFriends from "../../components/PositionPickerFriends"
import MyButton, { ButtonVariant } from "../../components/UI/MyButton"
import MyButtonLink from "../../components/UI/MyButtonLink"
import ScoreBar from "../../components/UI/ScoreBar"
import SwitchSelector from "../../components/UI/SwitchSelector"
import UserCard from "../../components/UserCard"
import { useTypedSelector } from "../../hooks/useTypedSelector"
import { NextThunkDispatch, wrapper } from "../../store"
import { setUserProps } from "../../store/actions/user"
import styles from '../../styles/PlayWithFriends.module.scss'
import { Imap, IvariantMaps } from "../../types/map"
import { userState } from "../../types/user"

interface PlayWithFriendsProps {
  map: Imap;
}

const PlayWithFriends : React.FC<PlayWithFriendsProps> = ({map}) => {
  const [loaded, setloaded] = useState(false)
  const [stage, setStage] = useState(0)
  const [switchStage, setSwitchStage] = useState(4)
  const [score, setScore] = useState(0)
  const [allScore, setAllScore] = useState(0)
  const [time, setTime] = useState(0)
  const [adminTime, setAdminTime] = useState(0)
  const [admin, setAdmin] = useState<userState>()
  const [friends, setFriends] = useState([])
  const [variantMaps, setVariantMaps] = useState<IvariantMaps[]>()
  const [choseChecked, setChoseChecked] = useState(false)
  const [alreadyChosed, setAlreadyChosed] = useState(false)
  const [gameEnd, setGameEnd] = useState(false)

  const [lineWidth, setLineWidth] = useState(0)
  const [chooses, setChooses] = useState<[{posX: number, posY: number, id: number, truePosX: number, truePosY: number, stage: number, score: number, name: string, lineWidth:number}]>()
  const [positions, setPositions] = useState<{posX: number, posY: number, truePosX: number, truePosY: number, name: string}>()

  const router = useRouter()
  const {socket, sockets} = useTypedSelector(st => st.socket) as any
  const user = useTypedSelector(st => st.user) as any
  const room = router.query.uuid

  useEffect(() => {
    let timer
    if (choseChecked && socket.connected) {
      clearTimeout(timer)
    } else if (socket.connected) {
      timer = setTimeout(() => {
        setTime(prev => prev + 1)
        socket.emit('ADD_TIME_FRIEND', room, user.id, time)
      }, 1000)
    }
    return () => {
      clearTimeout(timer)
    }
  }, [time, socket])
  

  useEffect(() => {
    if (socket.connected) {
      socket.emit('STARTED_PLAY_FRIENDS', room)
      socket.on('STARTED_PLAY_FRIENDS', (games, stage, score, chooses, userId, time, friends, end) => {
        console.log(games, stage, score, chooses, userId, time, friends)
        if (!(friends.some((f) => f.id === user.id) || user.id === userId)) {
          router.push('/404')
        }
        if (userId !== user.id) {
          findUser(userId).then((u) => setAdmin(u))
          setTime(friends.reduce((acc, cur) => {
            if (cur.id === user.id) {
              return acc = cur.time
            }
            return acc
          }, 0))
        } else {
          setAdmin(user)
          setTime(time)
        }
        if (chooses.some((c) => c.id === user.id && c.stage === stage)) {
          chooses.map((c) => {
            if (c.id === user.id && c.stage === stage) {
              setPositions({posX: c.posX, posY: c.posY, truePosY: c.truePosY, truePosX: c.truePosX, name: c.name})
              setAlreadyChosed(true)
            }
          })
        }
        setGameEnd(end)
        
        setChooses(chooses)
        setVariantMaps(games)
        setStage(stage)
        setFriends(friends)
        setloaded(true)
        
      })
    }
  }, [socket])

  useEffect(() => {
    setAllScore(chooses?.reduce((acc, cur) => {
      if (cur.id === user.id && cur.stage !== stage) {
        return acc = acc + cur.score
      }
      return acc
    }, 0))
    if (gameEnd) {
      setAllScore(chooses?.reduce((acc, cur) => {
        if (cur.id === user.id) {
          return acc = acc + cur.score
        }
        return acc
      }, 0))
    }
  }, [chooses, score, gameEnd])

  useEffect(() => {
    if (socket.connected) {
      if (!alreadyChosed && choseChecked && stage <= 4) {
        console.log(stage)
        socket.emit('FRIEND_MAP_CHECKED', room, {id: user.id, name: user.name, score: score, posX: positions.posX, posY: positions.posY, truePosX: positions.truePosX, truePosY: positions.truePosY, stage: stage, lineWidth: lineWidth})
      }
      socket.on('FRIEND_MAP_CHECKED', (chooses, end) => {
        setChooses(chooses)
        setGameEnd(end)
      })
      socket.on('NEXT_MAP_FRIENDS', () => {
        router.reload()
      })
      socket.on('ADD_TIME_FRIEND', (friends, adminTime) => {
        setFriends(friends)
        setAdminTime(adminTime)
      })
    }
  }, [choseChecked, socket, alreadyChosed])

  useEffect(() => {
    if (loaded && stage <= 4) {
      const getPanorama = () => {
        const img = new Image()
        img.src = `${process.env.REACT_APP_API_URL}/variantMaps/${variantMaps[stage].image}`
        img.onload = () => {
          const viewer = new Viewer({
            container: document.querySelector('#viewer') as any,
            panorama: `${process.env.REACT_APP_API_URL}/variantMaps/${variantMaps[stage].image}`,
            fisheye: false,
            defaultZoomLvl: 0,
            navbar: [],
            loadingImg: `${process.env.REACT_APP_API_URL}/map/${map.image}`,
            panoData: (img) => ({
              fullWidth: img.width,
              fullHeight: Math.round(img.width / 2),
              croppedWidth: img.width,
              croppedHeight: img.height,
              croppedX: 0,
              croppedY: Math.round((img.width / 2 - img.height) / 2),
            })
          });
        }
      }
      getPanorama()
    }
  }, [variantMaps])
  
  const handleNextMap = () => {
    if (socket.connected) {
      socket.emit('NEXT_MAP_FRIENDS', room)
    }
  }

  useEffect(() => {
    setSwitchStage(stage)
  }, [stage])
  

  return (
    <MainContainer title={loaded ? `Игра c друзьями на ${map.name}` : 'Загрузка игры...'}>
      <main className={styles.container}>
          <div className={styles.bg}></div>
          <div className={styles.friendsContainer}>
            <h2>Хост</h2>
            {admin && <UserCard allScore={chooses?.reduce((acc, cur) => cur.id === admin.id && cur.stage !== stage ? acc = acc + cur.score : acc, 0)} time={adminTime} withChooses={true} chooses={chooses?.filter((c) => admin.id === c.id && c.stage === stage)[0]} user={admin} />}
            <hr />
            {loaded && friends.map((f) => <UserCard key={f.id} time={f.time} withChooses={true} allScore={chooses?.reduce((acc, cur) => cur.id === f.id && cur.stage !== stage ? acc = acc + cur.score : acc, 0)} chooses={chooses?.filter((c) => f.id === c.id && c.stage === stage)[0]} user={f} />)}
          </div>
          {loaded ?
            <div id='viewer' style={{width: '100%', height: choseChecked ? '60vh' : '75vh', position: 'relative', overflow: 'hidden'}}>
              <PositionPickerFriends switchStage={switchStage} variantMaps={variantMaps} gameEnd={gameEnd} alreadyChosed={alreadyChosed} positions={positions} stage={stage} friendsChooses={chooses} setScore={setScore} choseChecked={choseChecked} setChoseChecked={setChoseChecked} map={map} variantMap={variantMaps[stage]} setLineWidth={setLineWidth} setPositions={setPositions} />
              <div className={styles.allScore}>
                <div className={styles.allScoreAtr}>
                  <p>Карта</p>
                  <h5>{map.name}</h5>
                </div>
                <div className={styles.allScoreAtr}>
                  <p>Раунд</p>
                  <h5>{stage + 1} / 5</h5>
                </div>
                <div className={styles.allScoreAtr}>
                  <p>Счёт</p>
                  <h5>{allScore}</h5>
                </div>
                <div className={styles.allScoreAtr}>
                  <p>Время</p>
                  <h5>{time + 's'}</h5>
                </div>
              </div>
            </div>
          : <div className='loader'></div>}
        </main>
        {stage == 4 && gameEnd &&  
          <div className={styles.scoreInfo}>
            <h2>Игра окончена</h2>
            <h4>Раунды: </h4>
            <SwitchSelector props={[{name: '1', onClick: () => setSwitchStage(0)}, {name: '2', onClick: () => setSwitchStage(1)}, {name: '3', onClick: () => setSwitchStage(2)}, {name: '4', onClick: () => setSwitchStage(3)}, {name: '5', onClick: () => setSwitchStage(4), checked: true}]} />
            <MyButtonLink link={'/'} variant={ButtonVariant.outlined}>На главную</MyButtonLink>
          </div>
        }
        {choseChecked && !gameEnd && <div className={styles.scoreInfo}><h2>Ожидаем других игроков...</h2></div>}
        {gameEnd && 
          <div className={styles.scoreInfo}>
            {chooses.map((c) => c.name !== undefined && c.stage === switchStage && 
              <>
                <ScoreBar title={`Cчёт ${c.name}: ${c.score === 0 ? 0 : c.score}`} width='600px' score={Math.round(c.score / 50)} />
                <p>Позиция {c.name} дальше на <b>{c.lineWidth}</b> шагов от правильного ответа</p>
                <p></p>
              </>
            )}
          </div>
        }
        {admin?.id === user.id && gameEnd && stage < 4 &&
          <div className={styles.scoreInfo}>
            <MyButton click={handleNextMap} variant={ButtonVariant.primary}>Следующая карта</MyButton>
          </div>
        }
    </MainContainer>
  )
}

export default PlayWithFriends

export const getServerSideProps : GetServerSideProps = wrapper.getServerSideProps(store => async ({req, res, query}) => {
  const dispatch = store.dispatch as NextThunkDispatch

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
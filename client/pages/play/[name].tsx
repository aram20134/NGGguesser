import { GetServerSideProps } from 'next'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import MainContainer from '../../components/MainContainer'
import { NextThunkDispatch, wrapper } from '../../store'
import { setMaps } from '../../store/actions/map'
import { setUserProps } from '../../store/actions/user'
import styles from '../../styles/Name[id].module.scss'
import { Viewer } from 'photo-sphere-viewer';
import anaxes from '../../public/anaxes.png'
import PositionPicker from '../../components/PositionPicker'
import { Imap, IvariantMaps, mapState } from '../../types/map'
import { useActions } from '../../hooks/useActions'
import { useTypedSelector } from '../../hooks/useTypedSelector'
import { io } from 'socket.io-client'
import { getCookie } from 'cookies-next'
import MyButton, { ButtonVariant } from '../../components/UI/MyButton'
import ScoreBar from '../../components/UI/ScoreBar'
import { useRouter } from 'next/router';
import { UserMapPlayed } from '../../api/mapAPI'

interface playProps {
  variantMap: IvariantMaps;
  map: Imap;
}

const Play : React.FC<playProps> = () => {
  const [choseChecked, setChoseChecked] = useState(false)
  const [score, setScore] = useState(0)
  const [allScore, setAllScore] = useState(0)
  const [lineWidth, setLineWidth] = useState(0)
  const [variantMaps, setVariantMaps] = useState<IvariantMaps>()
  const [map, setMap] = useState<Imap>()
  const [loaded, setLoaded] = useState(false)
  const [stage, setStage] = useState(0)
  const [positions, setPositions] = useState<{posX: number, posY: number, truePosX: number, truePosY: number}>()
  const [allChoses, setAllChoses] = useState<[{posX: number, posY: number, truePosX: number, truePosY: number}]>()
  const [checkAllChoses, setCheckAllChoses] = useState(false)

  const {setSocket} = useActions()
  const {maps} = useTypedSelector(st => st.map)
  const {id} = useTypedSelector(st => st.user)
  const router = useRouter()

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

    socket.on('USERS_ONLINE', async (data) => {
      setSocket({ sockets: data })
    })
    
    socket.emit('STARTED_PLAY', {room: router.query.name})

    socket.on('STARTED_PLAY', async (data, stage, score, chooses, userId) => {
      if (userId !== id) {
        router.replace('/404')
      }
      if (data === null || data === undefined) {
        router.replace('/404')
      }
      setAllChoses(chooses)
      if (stage <= 4) {
        var map = maps.filter((m) => m.id === data[stage].mapId ? true : false)
        setMap(map[0])
      } else {
        var map = maps.filter((m) => m.id === data[0].mapId ? true : false)
        setMap(map[0])
        setChoseChecked(true)
      }

      setAllScore(score)
      setStage(stage)
      setVariantMaps(data)
      setLoaded(true)
    })
    
    if (choseChecked && stage <= 4) {
      socket.emit('NEXT_MAP', {room: router.query.name, score: score, posX: positions.posX, posY: positions.posY, truePosX: positions.truePosX, truePosY: positions.truePosY})
    }
    if (choseChecked && stage == 4) {
      UserMapPlayed({score: allScore + score, mapId: map.id})
    }
    return () => {
      socket.disconnect()
    }
  }, [choseChecked, stage])

    useEffect(() => {
      if (loaded && stage <= 4) {
        const viewer = new Viewer({
          container: document.querySelector('#viewer') as any,
          panorama: `${process.env.REACT_APP_API_URL}/variantMaps/${variantMaps[stage].image}`,
          fisheye: false,
          defaultZoomLvl: 0,
          navbar: [],
          loadingImg: `${process.env.REACT_APP_API_URL}/map/${map.image}`,
          panoData: {
            fullWidth:3739,
            fullHeight: 1870,
            croppedHeight:977,
            croppedWidth:3739,
            croppedY:447,
            croppedX: 0
          }
        });
      }
  }, [variantMaps])
     
  if (stage <= 3) {
    return loaded && (
      <MainContainer title={`Игра на ${map.name}`}>
        <main className={styles.container}>
          <div className={styles.bg}></div>
            <div id='viewer' style={{width: '100%', height: choseChecked ? '60vh' : '80vh', position: 'relative', overflow: 'hidden'}}>
              <PositionPicker setPositions={setPositions} setLineWidth={setLineWidth} setScore={setScore} choseChecked={choseChecked} setChoseChecked={(arg) => setChoseChecked(arg)}  map={map} variantMap={variantMaps[stage]} />
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
              </div>
            </div>
            {choseChecked &&
              <div className={styles.scoreInfo}>
                <ScoreBar title={`Cчёт: ${score}`} width='600px' score={Math.round(score / 50)} />
                <p>Твоя позиция дальше на <b>{lineWidth} шагов</b> от правильного ответа.</p>
                {stage <= 3 
                ? (
                  <MyButton variant={ButtonVariant.primary} click={() => router.reload()}>Играть дальше</MyButton>
                )
                : (
                  <div style={{display: 'flex', flexDirection: 'row', gap: '50px'}}>
                    <MyButton variant={ButtonVariant.primary} click={() => setCheckAllChoses(true)}>Общий счёт</MyButton>
                    <MyButton variant={ButtonVariant.outlined} click={() => router.reload()}>Главное меню</MyButton>
                  </div>
                )}
              </div>
            }
        </main>
      </MainContainer>
    )
  } else {
    return loaded && (
      <MainContainer title={`Игра на ${map.name}`}>
        <main className={styles.container}>
          <div className={styles.bg}></div>
          <div style={{width: '100%', height: choseChecked ? '60vh' : '80vh', position: 'relative', overflow: 'hidden'}}>
            <PositionPicker allChoses={checkAllChoses} last={true} allPositions={allChoses} setPositions={setPositions} setLineWidth={setLineWidth} setScore={setScore} choseChecked={choseChecked} setChoseChecked={(arg) => setChoseChecked(arg)}  map={map} variantMap={variantMaps[stage]} />
          </div>
          {choseChecked &&
              <div className={styles.scoreInfo}>
                {score && !checkAllChoses && <ScoreBar title={`Cчёт: ${score}`} width='600px' score={Math.round(score / 50)} />}
                {score && checkAllChoses && <ScoreBar title={`Общий счёт: ${allScore}`} width='600px' score={Math.round(allScore / 250)} />}
                <p>Твоя позиция дальше на <b>{lineWidth} шагов</b> от правильного ответа.</p>
                  <div style={{display: 'flex', flexDirection: 'row', gap: '50px'}}>
                    <MyButton variant={ButtonVariant.primary} click={() => setCheckAllChoses(true)}>Общий счёт</MyButton>
                    <MyButton variant={ButtonVariant.outlined} click={() => router.push('/')}>Главное меню</MyButton>
                  </div>
              </div>
            }
        </main>
      </MainContainer>
    )
  }
}

export default Play

export const getServerSideProps : GetServerSideProps = wrapper.getServerSideProps(store => async ({req, res, query}) => {
    const dispatch = store.dispatch as NextThunkDispatch

    await dispatch(setMaps())
    await dispatch(setUserProps(req.cookies.token))
    var {user, map} = store.getState()
    var param = query.name

    // console.log(variantMaps)
    // var mapGame = map.maps.filter((m) => m.id === variantMaps[0].id)
    
    // if (!check) {
    //   return {
    //     notFound: true
    //   }
    // }
    if (!user.auth) {
      return {
        redirect: {destination: '/', permanent: true}
      }
    }
    
    return {
      props: {}
    }
  })
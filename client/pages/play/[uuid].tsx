import { GetServerSideProps, NextPage } from 'next'
import { useEffect, useState } from 'react'
import MainContainer from '../../components/MainContainer'
import { NextThunkDispatch, wrapper } from '../../store'
import { setMaps } from '../../store/actions/map'
import { setUserProps } from '../../store/actions/user'
import styles from '../../styles/Play.module.scss'
import { Viewer } from 'photo-sphere-viewer';
import PositionPicker from '../../components/PositionPicker'
import { Imap, IvariantMaps } from '../../types/map'
import { useTypedSelector } from '../../hooks/useTypedSelector'
import MyButton, { ButtonVariant } from '../../components/UI/MyButton'
import ScoreBar from '../../components/UI/ScoreBar'
import { useRouter } from 'next/router';
import { UserMapPlayed } from '../../api/mapAPI'
import { addExp } from './../../api/userAPI';

interface playProps {
  variantMap: IvariantMaps;
  map: Imap;
}

const Play : NextPage<playProps> = () => {
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
  const [time, setTime] = useState(1)

  const {maps} = useTypedSelector(st => st.map)
  const {id} = useTypedSelector(st => st.user)
  
  const router = useRouter()
  const {socket} = useTypedSelector(st => st.socket) as any


  useEffect(() => {
    let timer
    if (choseChecked && socket.connected) {
      socket.emit('ADD_TIME', {room: router.query.name, time})
      clearTimeout(timer)
    } else if (socket.connected) {
      timer = setTimeout(() => {
        setTime(prev => prev + 1)
        socket.emit('ADD_TIME', {room: router.query.uuid, time})
      }, 1000)
    }
    return () => {
      clearTimeout(timer)
    }
  }, [time, socket])

  useEffect(() => {
    if (socket.connected) {
      socket.emit('STARTED_PLAY', {room: router.query.uuid})

      socket.on('STARTED_PLAY', (data, stage, score, chooses, userId, time) => {
        setTime(time)
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
        socket.emit('NEXT_MAP', {room: router.query.uuid, score: score, posX: positions.posX, posY: positions.posY, truePosX: positions.truePosX, truePosY: positions.truePosY})
      }

      if (choseChecked && stage == 4) {
        socket.emit('STARTED_PLAY', {room: router.query.uuid})
        UserMapPlayed({score: allScore + score, mapId: map.id, time})
        if (map.difficult === 'hard') {
          addExp(Math.round((allScore + score) / 20))
        } else if (map.difficult === 'medium') {
          addExp(Math.round((allScore + score) / 50))
        } else {
          addExp(Math.round((allScore + score) / 100))
        }
      }
    }
  }, [choseChecked, stage, socket])

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
     
    return (
      <MainContainer title={loaded ? `Игра на ${map.name}` : 'Загрузка игры...'}>
        <main className={styles.container}>
          <div className={styles.bg}></div>
          <div>sdsdsd</div>
          {loaded ?
            <div id='viewer' style={{width: '100%', height: choseChecked ? '60vh' : '75vh', position: 'relative', overflow: 'hidden'}}>
               <PositionPicker allChoses={checkAllChoses} last={stage === 5 ? true : false} allPositions={allChoses} setPositions={setPositions} setLineWidth={setLineWidth} setScore={setScore} choseChecked={choseChecked} setChoseChecked={(arg) => setChoseChecked(arg)}  map={map} variantMap={variantMaps[stage]} />
              <div className={styles.allScore}>
                <div className={styles.allScoreAtr}>
                  <p>Карта</p>
                  <h5>{map.name}</h5>
                </div>
                <div className={styles.allScoreAtr}>
                  <p>Раунд</p>
                  <h5>{stage === 5 ? 5 : stage + 1} / 5</h5>
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
            {choseChecked &&
              <div className={styles.scoreInfo}>
                {score >= 0 && !checkAllChoses && <ScoreBar title={`Cчёт: ${score === 0 ? 0 : score}`} width='600px' score={Math.round(score / 50)} />}
                {stage >= 4 && score >= 0 && checkAllChoses && <ScoreBar title={`Общий счёт: ${allScore}`} width='600px' score={Math.round(allScore / 250)} />}
                <p>Твоя позиция дальше на <b>{lineWidth} шагов</b> от правильного ответа.</p>
                {stage <= 3 
                ? (
                  <MyButton variant={ButtonVariant.primary} click={() => router.reload()}>Играть дальше</MyButton>
                )
                : (
                  <div style={{display: 'flex', flexDirection: 'row', gap: '50px'}}>
                    {checkAllChoses 
                    ? (<MyButton variant={ButtonVariant.primary} click={() => setCheckAllChoses(!checkAllChoses)}>Последний выбор</MyButton>)
                    : (<MyButton variant={ButtonVariant.primary} click={() => setCheckAllChoses(!checkAllChoses)}>Общий счёт</MyButton>)
                    }
                    <MyButton variant={ButtonVariant.outlined} click={() => router.push('/')}>Главное меню</MyButton>
                  </div>
                )}
              </div>
            }
        </main>
      </MainContainer>
    ) 
}

export default Play

export const getServerSideProps : GetServerSideProps = wrapper.getServerSideProps(store => async ({req, res, query}) => {
  const dispatch = store.dispatch as NextThunkDispatch

  await dispatch(setMaps())
  await dispatch(setUserProps(req.cookies.token))
  var {user} = store.getState()

  if (!user.auth) {
    return {
      redirect: {destination: '/', permanent: true}
    }
  }
  
  return {
    props: {}
  }
})
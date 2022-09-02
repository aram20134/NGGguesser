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

interface playProps {
  variantMap: IvariantMaps;
  map: Imap;
  socket: any;
}

const play : React.FC<playProps> = ({map, variantMap, socket}) => {
  const [choseChecked, setChoseChecked] = useState(false)
  const [score, setScore] = useState(0)
  const [lineWidth, setLineWidth] = useState(0)

  const {setSocket} = useActions()
  const user = useTypedSelector(st => st.user)

  useEffect(() => {
    if (user.name !== 'user') {
      socket = io(process.env.REACT_APP_API_URL, {auth: {token : getCookie('token')}})
    }
  }, [user])

  useEffect(() => {
    if (user.name !== 'user') {
        socket.on('connect', () => {
            socket.emit('USER_ONLINE')
        })
        socket.on('USERS_ONLINE', (data) => {
          setSocket({sockets: data})
        })
    }
    return () => {
      socket.disconnect()
    }
  }, [socket])

    useEffect(() => {
        // console.log(socket);
        // console.log(variantMap, map);
        const viewer = new Viewer({
          container: document.querySelector('#viewer') as any,
          panorama: `${process.env.REACT_APP_API_URL}/variantMaps/${variantMap.image}`,
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
    }, [])
    
  return (
    <MainContainer title={`Игра на ${map.name}`}>
      <main className={styles.container}>
        <div className={styles.bg}></div>
          <div id='viewer' style={{width: '100%', height: choseChecked ? '60vh' : '80vh', position: 'relative', overflow: 'hidden'}}>
            <div className="mapPicker">
              <PositionPicker setLineWidth={setLineWidth} setScore={setScore} choseChecked={choseChecked} setChoseChecked={(arg) => setChoseChecked(arg)}  map={map} variantMap={variantMap} />
            </div>
          </div>
          {choseChecked &&
            <div className={styles.scoreInfo}>
              <ScoreBar title={`счёт: ${score}`} width='600px' score={Math.round(score / 50)} />
              <p>Твоя позиция дальше на <b>{lineWidth} пикселей</b> от правильного ответа.</p>
              <MyButton variant={ButtonVariant.primary} click={() => console.log('sd')}>Играть дальше</MyButton>
            </div>
          }
      </main>
    </MainContainer>
  )
}

export default play

export const getServerSideProps : GetServerSideProps = wrapper.getServerSideProps(store => async ({req, res, query}) => {
    const dispatch = store.dispatch as NextThunkDispatch
    // var socket = io(process.env.REACT_APP_API_URL, {auth: {token : req.cookies.token}})
    await dispatch(setMaps())
    await dispatch(setUserProps(req.cookies.token))
    const {map, user} = store.getState()
    const param = query.name
    // const check = map.maps.filter((m) => m.variantMaps)
    for (let i = 0; i < map.maps.length; i++) {
      for (let j = 0; j < map.maps[i].variantMaps.length; j++) {
          if (map.maps[i].variantMaps[j].name === param) {
            var check = map.maps[i].variantMaps[j]
            var checkMap = map.maps[i]
          }
      }
    }
 
    if (!check) {
      return {
        notFound: true
      }
    }
    if (!user.auth) {
      return {
        redirect: {destination: '/', permanent: true}
      }
    }
    
    return {
      props: {variantMap: check, map: checkMap}
    }
  })
import React, { useEffect, useState } from 'react'
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { NextThunkDispatch, wrapper } from '../../store';
import { setMaps } from '../../store/actions/map';
import { setUserProps } from '../../store/actions/user';
import { useTypedSelector } from './../../hooks/useTypedSelector';
import MainContainer from '../../components/MainContainer';
import styles from '../../styles/Map[id].module.scss'
import Image from 'next/image';
import like from '../../public/like.svg'
import liked from '../../public/liked.svg'
import people from '../../public/people.svg'
import avgScore from '../../public/avgScore.svg'
import mapVariant from '../../public/mapVariant.svg'
import { delLike, setLike } from '../../api/mapAPI';
import MyButtonLink from '../../components/UI/MyButtonLink';
import { ButtonVariant } from '../../components/UI/MyButton';
import { useActions } from '../../hooks/useActions';
import { io } from 'socket.io-client';
import { getCookie } from 'cookies-next';


const map = ({param, likesMap, variantMap}) => {
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(likesMap)
  var socket;
  var {maps} = useTypedSelector(st => st.map)
  const user = useTypedSelector(st => st.user)
  const {setSocket} = useActions()
  
  maps = maps.filter((m) => m.name.toLowerCase() === param ? true : false)
  const map = maps[0]

  useEffect(() => {
    map.likes.map((l) => {
      if (l.userId === user.id) {
        setIsLiked(true)
      }
    })

  }, [])
  
  const setUserLike = () => {
    if (isLiked === true) {
      setLikes(prev => prev - 1)
      delLike({mapId: map.id})
    } else {
      setLikes(prev => prev + 1)
      setLike({mapId:map.id})
    }
    setIsLiked(!isLiked)
  }


    useEffect(() => {
        if (user.name !== 'user') {
          socket = io(process.env.REACT_APP_API_URL, {auth: {token : getCookie('token')}})
        }
    }, [user])

    // useEffect(() => {
    //   socket.emit('START_PLAY', (map.id))
    //   socket.on('STARTED_PLAY', (d) => {
    //     console.log(d)
    //   })
    // }, [socket])
    

  return (
    <MainContainer title={`Карта ${param}`}>
      <main className={styles.map}>
        <div className={styles.bg}></div>
        <div className={styles.container}>
          <Image src={`${process.env.REACT_APP_API_URL}/map/${map.image}`} width='300px' height='300px' className={styles.map} />
          <div className={styles.desc}>
            <h1>{map.name}</h1>
            <p>{map.description}</p>
          </div>
        </div>
        <div className={styles.container2}>
          <div className={styles.mapInfo}>
            <Image src={avgScore} width='48px' height='48px' />
            <div className={styles.mapDesc}>
              <h3>2100</h3>
              <p>Ср. счёт</p>
            </div>
          </div>
          <div className={styles.mapInfo}>
            <Image src={people} width='48px' height='48px' className={styles.liked} />
            <div className={styles.mapDesc}>
              <h3>12</h3>
              <p>Исследовали</p>
            </div>
          </div>
          <div className={styles.mapInfo}>
            <Image src={mapVariant} width='48px' height='48px' />
            <div className={styles.mapDesc}>
              <h3>{map.variantMaps.length}</h3>
              <p>Локаций</p>
            </div>
          </div>
          <div className={styles.mapInfo}>
            <button onClick={() => setUserLike()} className={styles.btn}><Image src={isLiked ? liked : like} width='48px' height='48px' /></button>
            <div className={styles.mapDesc}>
              <h3>{likes}</h3>
              <p>Лайков</p>
            </div>
          </div>
        </div>
        <div className={styles.container3}>
            <MyButtonLink variant={ButtonVariant.primary} link={`/play/${variantMap}`}>Играть</MyButtonLink>
        </div>
      </main>
    </MainContainer>
  )
}

export default map

export const getServerSideProps : GetServerSideProps = wrapper.getServerSideProps(store => async ({req, res, query}) => {
  const dispatch = store.dispatch as NextThunkDispatch

  await dispatch(setMaps())
  await dispatch(setUserProps(req.cookies.token))
  const {map, user, socket} = store.getState()
  const param = query.name
  const check = map.maps.filter((m) => m.name.toLowerCase() === param ? true : false)

  const i = Math.floor(Math.random() * check[0]?.variantMaps?.length)
  const variantMap = check[0].variantMaps[i].name

  if (check.length === 0) {
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
    props: {param, likesMap: check[0].likes.length, variantMap}
  }
})
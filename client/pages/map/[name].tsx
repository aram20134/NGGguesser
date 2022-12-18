import { useEffect, useState } from 'react'
import { NextPage } from 'next';
import { GetServerSideProps } from 'next';
import { NextThunkDispatch, wrapper } from '../../store';
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
import { v4 as uuidv4 } from 'uuid';
import Highscore from '../../components/Highscore';
import { findMap } from './../../api/mapAPI';
import { Imap } from '../../types/map'

interface mapProps {
  map: Imap;
}

const Map : NextPage<mapProps> = ({map}) => {

  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(map.likes.length)
  const [UUID, setUUID] = useState()
  const user = useTypedSelector(st => st.user)

  const {socket} = useTypedSelector(st => st.socket) as any

  useEffect(() => {
    if (socket.id) {
      const room = uuidv4()
      setUUID(room)
      socket.emit('START_PLAY', {mapId: map.id, room})
    }
  }, [socket])
  

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

  return (
    <MainContainer title={`Карта ${map.name}`}>
      <main className={styles.map}>
        <div className={styles.bg}></div>
        <div className={styles.container}>
          <div className={styles.imageContainer}><Image priority src={`${process.env.REACT_APP_API_URL}/map/${map.image}`} width='300px' height='300px' className={styles.map} /></div>
          <div className={styles.desc}>
            <h1>{map.name}</h1>
            <p>{map.description}</p>
          </div>
        </div>
        <div className={styles.container2}>
          <div className={styles.mapInfo}>
            <Image src={avgScore} width='48px' height='48px' />
            <div className={styles.mapDesc + ' ' + (map.difficult === 'easy' ? styles.easy : styles.easy)}>
              <h3>{Math.round(map.userMapPlayeds.length != 0 ? map.userMapPlayeds.reduce((acc, cur, i, arr) => {return acc += cur.score}, 0) / map.userMapPlayeds.length : 0)}</h3>
              <p>Ср. счёт</p>
            </div>
          </div>
          <div className={styles.mapInfo}>
            <Image src={people} width='48px' height='48px' className={styles.liked} />
            <div className={styles.mapDesc}>
              <h3>{map.userMapPlayeds.length}</h3>
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
            <MyButtonLink variant={ButtonVariant.primary} link={`/play/${UUID}`}>Играть</MyButtonLink>
        </div>
        <Highscore map={map.id} />
      </main>
    </MainContainer>
  )
}

export default Map

export const getServerSideProps : GetServerSideProps = wrapper.getServerSideProps(store => async ({req, res, query}) => {
  const dispatch = store.dispatch as NextThunkDispatch
  await dispatch(setUserProps(req.cookies.token))

  var param = query.name.toLocaleString()
  param = param[0].toUpperCase() + param.slice(1)

  const {map} = await findMap(param)
  const {user} = store.getState()

  if (!map) {
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
    props: {map}
  }
})
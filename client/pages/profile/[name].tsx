import { GetServerSideProps, NextPage } from 'next'
import { useEffect, useState } from 'react'
import MainContainer from '../../components/MainContainer'
import { NextThunkDispatch, wrapper } from '../../store'
import { setUserProps } from '../../store/actions/user'
import { useRouter } from 'next/router';
import styles from '../../styles/profile[name].module.scss'
import { findUser } from '../../api/userAPI'
import Image from 'next/image'
import MyButton, { ButtonVariant } from '../../components/UI/MyButton'
import { userState } from '../../types/user'
import ScoreBar from '../../components/UI/ScoreBar'
import Link from 'next/link'
import map from '../../public/mapVariant.svg'
import people from '../../public/people.svg'
import like from '../../public/like.svg'
import activity from '../../public/avgScore.svg'
import { GetUserMapPlayed } from '../../api/mapAPI'
import { IuserMapPlayeds } from '../../types/map'
import { deleteCookie } from 'cookies-next'

interface NameProps {
  user: userState
  owner: boolean;
}

const Name : NextPage<NameProps> = ({user, owner}) => {
  const [mapPlayed, setMapPlayed] = useState<IuserMapPlayeds[]>([])
  const [loaded, setLoaded] = useState(false)
  const router = useRouter()
  
  const avatar = user.avatar === "userNoImage.png" ? user.avatar.split('.').shift() + '.svg' : user.avatar

  useEffect(() => {
    GetUserMapPlayed(user.id).then((res) => {setMapPlayed(res), setLoaded(true)})

  }, [])

  return mapPlayed && owner ? (
    <MainContainer title={`Профиль ${router.query.name}`}>
      <main className={styles.profile}>
        <div className={styles.bg}></div>
        <div className={styles.container}>
          <Image loading='lazy' src={`${process.env.REACT_APP_API_URL}/user/${avatar}`} width='150px' height='150px' />
          <MyButton myStyle={{fontSize: '16px'}} variant={ButtonVariant.outlined} click={() => console.log('click')}>Редактировать</MyButton>
          <h1>{user.name[0].toUpperCase() + user.name.slice(1)}</h1>
          <div className={styles.LVL}>
            <p>LVL {user.level}</p>
            <ScoreBar myStyle={{height: '24px'}} width={'30%'} score={user.exp / (150 * (user.level + 1)) * 100} overlayLeft={user.exp === 0 ? "0" : user.exp} overlayRight={150 * (user.level + 1)} />
            <p>LVL {user.level + 1}</p>
          </div>
          <hr />
          <div className={styles.actionContainer}>
            <Link href={`${user.name}/games`}>
              <a>
                <div className={styles.action}>
                  <Image src={map} />
                  Текущие игры
                </div>
              </a>
            </Link>
            <Link href={`${user.name}/friends`}>
              <a>
                <div className={styles.action}>
                  <Image objectFit='contain' src={people} />
                  Друзья
                </div>
              </a>
            </Link>
            <Link href={`${user.name}/activities`}>
              <a>
                <div className={styles.action}>
                  <Image src={activity} />
                  Активность
                </div>
              </a>
            </Link>
            <Link href={`${user.name}/mapLiked`}>
              <a>
                <div className={styles.action}>
                  <Image src={like} />
                  Понравившиеся <br /> карты
                </div>
              </a>
            </Link>
            {user.role === 'ADMIN' && 
            <Link href={`${user.name}/adminPanel`}>
              <a className={styles.adminPanel}>
                <p>Админ Панель</p>
              </a>
            </Link>}
          </div>
          <hr />
          <h2>Статистика</h2>
          <div className={styles.statsContainer}>
            <div className={styles.stats}>
              <h2>{loaded ? mapPlayed.length : (<div className="mini-loader" style={{width: '35px', height:'35px'}}></div>)}</h2>
              <p>Завёршённых игр</p>
            </div>
            <div className={styles.stats}>
              <h2>{loaded ? mapPlayed.length > 1 ? Math.round(mapPlayed.reduce((acc, cur) => {return acc + cur.score}, 0) / mapPlayed.length) : '0' : (<div className="mini-loader" style={{width: '35px', height:'35px'}}></div>)}</h2>
              <p>Средний счёт</p>
            </div>
            <div className={styles.stats}>
              <h2>{loaded ? mapPlayed.reduce((acc, cur) => {return acc > cur.score ? acc : cur.score}, 0) : (<div className="mini-loader" style={{width: '35px', height:'35px'}}></div>)}</h2>
              <p>Лучшая игра</p>
            </div>
          </div>
          <MyButton variant={ButtonVariant.outlined} click={() => {deleteCookie('token'), router.push('/')}}>Выйти</MyButton>
        </div>
      </main>
    </MainContainer>
  ) : mapPlayed && (
    <MainContainer title={`Профиль ${router.query.name}`}>
      <main className={styles.profile}>
        <div className={styles.bg}></div>
        <div className={styles.container}>
          <Image src={`${process.env.REACT_APP_API_URL}/user/${avatar}`} width='150px' height='150px' />
          <h1>{user.name[0].toUpperCase() + user.name.slice(1)}</h1>
          <div className={styles.LVL}>
            <p>LVL {user.level}</p>
            <ScoreBar myStyle={{height: '24px'}} width={'30%'} score={user.exp / (150 * (user.level + 1)) * 100} overlayLeft={user.exp === 0 ? "0" : user.exp} overlayRight={150 * (user.level + 1)} />
            <p>LVL {user.level + 1}</p>
          </div>
          <hr />
          <h2>Статистика</h2>
          <div className={styles.statsContainer}>
            <div className={styles.stats}>
              <h2>{mapPlayed.length}</h2>
              <p>Завёршённых игр</p>
            </div>
            <div className={styles.stats}>
              <h2>{mapPlayed.length > 1 ? Math.round(mapPlayed.reduce((acc, cur) => {return acc + cur.score}, 0) / mapPlayed?.length) : '0'}</h2>
              <p>Средний счёт</p>
            </div>
            <div className={styles.stats}>
              <h2>{mapPlayed.reduce((acc, cur) => {return acc > cur.score ? acc : cur.score}, 0)}</h2>
              <p>Лучшая игра</p>
            </div>
          </div>
        </div>
      </main>
    </MainContainer>
  )
}

export default Name

export const getServerSideProps : GetServerSideProps = wrapper.getServerSideProps(store => async ({req, res, query}) => {
    const dispatch = store.dispatch as NextThunkDispatch

    dispatch(setUserProps(req.cookies.token))
    var {user} = store.getState()
    var response = await findUser(null, query.name)

    if (!response) {
      return {
        notFound: true
      }
    }

    const owner = query.name === user.name
    
    return {
      props: {user: response, owner}
    }
  })
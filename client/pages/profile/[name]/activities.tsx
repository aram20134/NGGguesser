import { GetServerSideProps, NextPage } from 'next'
import { findUser, findUserServer, getUserActivityServer } from '../../../api/userAPI'
import MainContainer from '../../../components/MainContainer'
import { NextThunkDispatch, wrapper } from '../../../store'
import { setMaps } from '../../../store/actions/map'
import { setUserProps } from '../../../store/actions/user'
import styles from '../../../styles/Activities.module.scss'
import { mapState } from '../../../types/map'
import { userState } from '../../../types/user'
import mapSVG from '../../../public/mapVariant.svg'
import like from '../../../public/liked.svg'
import Image from 'next/image'
import Link from 'next/link'
import people from '../../../public/people.svg'
import lvlup from '../../../public/lvlup.svg'
import { useEffect, useState } from 'react'
import UserCard from '../../../components/UserCard'

interface activitiesProps {
  user: userState;
  dates: any;
  map: mapState;
}

const Activities : NextPage<activitiesProps> = ({user, dates, map}) => {  
  const [keys, setKeys] = useState([])
  const [date, setDate] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // getUserActivity(1).then(res => console.log(res))
    console.log(dates)
    setKeys(Object.keys(dates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).reverse())
  }, [])
  
  useEffect(() => {
    setDate(keys.map((key) => dates[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).reverse()))
  }, [keys])

  useEffect(() => {
    setLoaded(true)
  }, [date])
  
  return (
    <MainContainer title='Активность'>
      <main className={styles.activities}>
        <div className={styles.bg}></div>
        <div className={styles.container}>
          <div className={styles.activitiesContainer}>
            <h1>Активность</h1>
            {loaded ? keys.map((key, i) => {
              return (
                <div key={key} className={styles.activity}>
                  <div className={styles.lineBar}><h3>{new Date(key).toLocaleDateString()}</h3> <div className={styles.line}></div></div>
                  {date[i]?.map((a, i) => {
                    switch (a.action) {
                      case 'map_played':
                        var m = map.maps.filter((m) => m.id === a.mapId)[0]
                        return <div key={i} className={styles.action}><Image src={mapSVG} /><p>Вы сыграли на <Link href={`/map/${m.name.toLowerCase()}`}>{m.name}</Link> за <b>{a.time}</b> сек со счётом <b>{a.score}</b> и заработали <b>{Math.round(a.score / 100)}</b> опыта</p></div>
                      case 'map_liked':
                        var m = map.maps.filter((m) => m.id === a.mapId)[0]
                        return <div key={i} className={styles.action}><Image src={like} /><p>Вы поставили лайк на карту <Link href={`/map/${m.name.toLowerCase()}`}>{m.name}</Link></p></div>
                      case 'level_up':
                        return <div key={i} className={styles.action}><Image width={32} height={32} src={lvlup} /><p>Вы повысили свой уровень <b>{a.prevLvl} {'>'} {a.nextLvl}</b></p></div>
                      case 'add_friend':
                        return <div key={i} className={styles.action}><Image width={32} height={32} src={people} />
                          <p>Вы добавили друга: </p>
                          <Link href={`/profile/${a.name}`}><a>{a.name}</a></Link>
                        </div>
                    }
                  }
                  )}
                </div>
              )
            }): <div className='loader'></div>}
          </div>
        </div>
      </main>
    </MainContainer>
  )
}

export default Activities


export const getServerSideProps : GetServerSideProps = wrapper.getServerSideProps(store => async ({req, res, query}) => {
  const dispatch = store.dispatch as NextThunkDispatch

  await dispatch(setUserProps(req.cookies.token))
  await dispatch(setMaps())
  
  var {user, map} = store.getState()
  var param = query.name
  const activity = await getUserActivityServer(user.id)
  var dates = []
  var friends = activity.friends.reverse()
  // Reversing dates of all activites... I know, this looks awful ^)

  activity.user.friends.reverse().map((f, i) => {
    var date = new Date(f.createdAt).toDateString()
    if (dates[date]) {
      dates[date] = [...dates[date], {action: 'add_friend', ...friends[i], date: f.createdAt}]
    } else {
      dates[date] = [{action: 'add_friend', ...friends[i], date: f.createdAt}]
    }
  })
  
  activity.user.userMapPlayeds.map((m) => {
    var date = new Date(m.createdAt).toDateString()
    if (dates[date]) {
      dates[date] = [...dates[date], {action: 'map_played', mapId: m.mapId, time: m.time, score: m.score, date: m.createdAt}]
    } else {
      dates[date] = [{action: 'map_played', mapId: m.mapId, time: m.time, score: m.score, date: m.createdAt}]
    }
  })

  activity.user.likes.map((l) => {
    var date = new Date(l.createdAt).toDateString()
    if (dates[date]) {
      dates[date] = [...dates[date], {action: 'map_liked', mapId: l.mapId, date: l.createdAt}]
    } else {
      dates[date] = [{action: 'map_liked', mapId: l.mapId, date: l.createdAt}]
    }
  })

  activity.user.levelUps.map((l) => {
    var date = new Date(l.createdAt).toDateString()
    if (dates[date]) {
      dates[date] = [...dates[date], {action: 'level_up', prevLvl: l.prevLvl, nextLvl: l.nextLvl, date: l.createdAt}]
    } else {
      dates[date] = [{action: 'level_up', prevLvl: l.prevLvl, nextLvl: l.nextLvl, date: l.createdAt}]
    }
  })

  let reverse = []
  Object.keys(dates).reverse().forEach((key) => reverse[key] = [...dates[key].reverse()])

  if (param !== user.name) {
    return {
      notFound: true
    }
  }
  
  return {
    props: {user, dates: {...reverse}, map}
  }
})
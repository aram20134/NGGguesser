import { GetServerSideProps, NextPage } from 'next'
import { getUserActivity } from '../../../api/userAPI'
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
import lvlup from '../../../public/lvlup.svg'

interface activitiesProps {
  user: userState;
  dates: any;
  map: mapState;
}

const Activities : NextPage<activitiesProps> = ({user, dates, map}) => {

  return (
    <MainContainer title='Активность'>
      <main className={styles.activities}>
        <div className={styles.bg}></div>
        <div className={styles.container}>
          <div className={styles.activitiesContainer}>
            <h1>Активность</h1>
            {Object.keys(dates).map((key) => {
              return (
                <div key={key} className={styles.activity}>
                  <div className={styles.lineBar}><h3>{key}</h3> <div className={styles.line}></div></div>
                  {dates[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).reverse().map((a, i) => {
                    switch (a.action) {
                      case 'map_played':
                        var m = map.maps.filter((m) => m.id === a.mapId)[0]
                        return <div key={i} className={styles.action}><Image loading='lazy' src={mapSVG} /><p>Вы сыграли на <Link href={`/map/${m.name.toLowerCase()}`}>{m.name}</Link> со счётом {a.score} и заработали {Math.round(a.score / 100)} опыта</p></div>
                      case 'map_liked':
                        var m = map.maps.filter((m) => m.id === a.mapId)[0]
                        return <div key={i} className={styles.action}><Image loading='lazy' src={like} /><p>Вы поставили лайк на карту <Link href={`/map/${m.name.toLowerCase()}`}>{m.name}</Link></p></div>
                      case 'level_up':
                        return <div key={i} className={styles.action}><Image loading='lazy' width={32} height={32} src={lvlup} /><p>Вы повысили свой уровень <b>{a.prevLvl} {'>'} {a.nextLvl}</b></p></div>
                    }
                  }
                  )}
                </div>
              )
            })}
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
  const activity = await getUserActivity(user.id)
  var dates = []
  
  // Reversing dates of all activites... I know, this looks awful ^)

  activity.user.userMapPlayeds.reverse().map((m) => {
    var date = new Date(m.updatedAt).toLocaleDateString()
    if (dates[date]) {
      dates[date] = [...dates[date], {action: 'map_played', mapId: m.mapId, score: m.score, date: m.updatedAt}]
    } else {
      dates[date] = [{action: 'map_played', mapId: m.mapId, score: m.score, date: m.updatedAt}]
    }
  })

  activity.user.likes.reverse().map((l) => {
    var date = new Date(l.updatedAt).toLocaleDateString()
    if (dates[date]) {
      dates[date] = [...dates[date], {action: 'map_liked', mapId: l.mapId, date: l.updatedAt}]
    } else {
      dates[date] = [{action: 'map_liked', mapId: l.mapId, date: l.updatedAt}]
    }
  })

  activity.user.levelUps.reverse().map((l) => {
    var date = new Date(l.updatedAt).toLocaleDateString()
    if (dates[date]) {
      dates[date] = [...dates[date], {action: 'level_up', prevLvl: l.prevLvl, nextLvl: l.nextLvl ,date: l.updatedAt}]
    } else {
      dates[date] = [{action: 'level_up', prevLvl: l.prevLvl, nextLvl: l.nextLvl ,date: l.updatedAt}]
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
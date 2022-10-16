import { GetServerSideProps, NextPage } from 'next'
import React, { useEffect, useState } from 'react'
import { getUserActivity } from '../../../api/userAPI'
import MainContainer from '../../../components/MainContainer'
import { NextThunkDispatch, wrapper } from '../../../store'
import { setMaps } from '../../../store/actions/map'
import { setUserProps } from '../../../store/actions/user'
import styles from '../../../styles/Activities.module.scss'
import { mapState } from '../../../types/map'
import { userState } from '../../../types/user'
import { useSocket } from './../../../hooks/useSocket';
import mapSVG from '../../../public/mapVariant.svg'
import like from '../../../public/liked.svg'
import Image from 'next/image'
import Link from 'next/link'

interface activitiesProps {
  user: userState;
  dates: any;
  map: mapState;
}

const Activities : NextPage<activitiesProps> = ({user, dates, map}) => {
  const socket = useSocket()

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
                        return <div key={i} className={styles.action}><Image src={mapSVG} />Вы сыграли на <Link href={`/map/${m.name.toLowerCase()}`}>{m.name}</Link> со счётом {a.score}</div>
                      case 'map_liked':
                        var m = map.maps.filter((m) => m.id === a.mapId)[0]
                        return <div key={i} className={styles.action}><Image src={like} />Вы поставили лайк на карту {m.name}</div>
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
  activity.user.userMapPlayeds.reverse().map((m) => {
    var date = new Date(m.updatedAt).toLocaleDateString()
    if (dates[date]) {
      dates[date] = [...dates[date], {action: 'map_played', mapId: m.mapId, score: m.score, date: m.updatedAt}]
    } else {
      dates[date] = [{action: 'map_played', mapId: m.mapId, score: m.score, date: m.updatedAt}]
    }
  })
  // console.log(dates)
  
  activity.user.likes.reverse().map((l) => {
    var date = new Date(l.updatedAt).toLocaleDateString()
    if (dates[date]) {
      dates[date] = [...dates[date], {action: 'map_liked', mapId: l.mapId, date: l.updatedAt}]
    } else {
      dates[date] = [{action: 'map_liked', mapId: l.mapId, date: l.updatedAt}]
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
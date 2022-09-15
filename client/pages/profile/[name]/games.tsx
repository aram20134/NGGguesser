import { GetServerSideProps, NextPage } from 'next'
import React, { ReactEventHandler, useEffect, useState } from 'react'
import { getMaps } from '../../../api/mapAPI'
import MainContainer from '../../../components/MainContainer'
import MyButton, { ButtonVariant } from '../../../components/UI/MyButton'
import MyButtonLink from '../../../components/UI/MyButtonLink'
import { useSocket } from '../../../hooks/useSocket'
import { NextThunkDispatch, wrapper } from '../../../store'
import { setMaps } from '../../../store/actions/map'
import { setUserProps } from '../../../store/actions/user'
import styles from '../../../styles/Games.module.scss'
import { Imap, IvariantMaps, mapState } from '../../../types/map'
import { userState } from '../../../types/user'

interface gamesProps {
  user: userState;
  map: mapState;
}

interface currGameProps {
  room: string;
  stage: number;
  score: number;
  dateStart: number;
  mapId: number;
}

const Games : NextPage<gamesProps> = ({user, map}) => {
  const socket = useSocket()
  const [currGames, setCurrGames] = useState<[currGameProps]>()

  const delCurrMap = async (e : React.ChangeEvent<HTMLDivElement>, room) => {
    socket.emit('DEL_CURR_MAP', {room})
    setCurrGames(currGames.filter((g) => g.room !== room && g) as [currGameProps])
  }

  useEffect(() => {
    if (socket) {
      socket.emit('GET_CURR_MAPS', ({userId: user.id}))
      socket.on('GET_CURR_MAPS', (currGames) => {
        setCurrGames(currGames.filter((curr) => curr.stage <= 4))
      })
    }
  }, [socket])
  
  if (!currGames) {
    return (
      <MainContainer title='Текущие игры'>
      <main className={styles.games}>
        <div className={styles.bg}></div>
        <div className={styles.gamesContainer}>
          <h1>Текущие игры</h1>
        </div>
      </main>
    </MainContainer>
    )
  }

  return (
    <MainContainer title='Текущие игры'>
      <main className={styles.games}>
        <div className={styles.bg}></div>
        <div className={styles.gamesContainer}>
          <h1>Текущие игры</h1>
          <div className={styles.currGames}>
            {currGames.map((curr) => {
              return (
                <div id='currGame' key={curr.dateStart} className={styles.currGame}>
                  <div className={styles.row}>
                    <h2>{map.maps.map((m) => m.id === curr.mapId ? m.name : '' )}</h2>
                    <div className={styles.buttonsContainer}>
                      <MyButtonLink myStyle={{fontSize: '18px', padding: '5px 15px'}} variant={ButtonVariant.primary} link={`/play/${curr.room}`}>Продолжить</MyButtonLink>
                      <MyButton myStyle={{fontSize: '18px', padding: '5px 15px', background: 'red'}} variant={ButtonVariant.primary} click={(e) => delCurrMap(e, curr.room)}>Удалить</MyButton>
                    </div>
                  </div>
                  <hr />
                  <p>{new Date(curr.dateStart).toLocaleDateString() === new Date().toLocaleDateString() ? 'Сегодня' : 'Вчера'} - Round {curr.stage + 1} / 5</p>
                </div>
              ) 
            })}
          </div>
          {currGames.length < 1 && <h4>У вас нет начатых игр</h4>}
        </div>
      </main>
    </MainContainer>
  )
}

export default Games


export const getServerSideProps : GetServerSideProps = wrapper.getServerSideProps(store => async ({req, res, query}) => {
  const dispatch = store.dispatch as NextThunkDispatch

  await dispatch(setUserProps(req.cookies.token))
  await dispatch(setMaps())
  const {user, map} = store.getState()
  var param = query.name

  if (param !== user.name) {
    return {
      notFound: true
    }
  }
  
  return {
    props: {user, map}
  }
})
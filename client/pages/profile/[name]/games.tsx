import { GetServerSideProps, NextPage } from 'next'
import { useEffect, useState } from 'react'
import MainContainer from '../../../components/MainContainer'
import Alert, { AlertVariant } from '../../../components/UI/Alert'
import MyButton, { ButtonVariant } from '../../../components/UI/MyButton'
import MyButtonLink from '../../../components/UI/MyButtonLink'
import Tooltip from '../../../components/UI/Tooltip'
import { NextThunkDispatch, wrapper } from '../../../store'
import { setMaps } from '../../../store/actions/map'
import { setUserProps } from '../../../store/actions/user'
import styles from '../../../styles/Games.module.scss'
import { mapState } from '../../../types/map'
import { userState } from '../../../types/user'
import { useTypedSelector } from './../../../hooks/useTypedSelector';

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
  time: number;
}

const Games : NextPage<gamesProps> = ({user, map}) => {
  const {socket} = useTypedSelector(st => st.socket) as any
  const [currGames, setCurrGames] = useState<[currGameProps]>()

  const delCurrMap = async (e : React.ChangeEvent<HTMLDivElement>, room) => {
    socket.emit('DEL_CURR_MAP', {room})
    setCurrGames(currGames.filter((game) => game.room !== room && game) as [currGameProps])
  }

  useEffect(() => {
    if (socket.auth) {
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
          <div className={styles.gamesContainer}>
            {!socket.disconnected ? <div className='loader'></div> : <Alert variant={AlertVariant.danger} title='Функционал ограничен'>Закройте дополнительные вкладки сайта</Alert>}
          </div>
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
                  <Tooltip title={new Date(curr.dateStart).toLocaleDateString() + ' ' + new Date(curr.dateStart).toLocaleTimeString()}>
                    <p>{new Date(curr.dateStart).toLocaleDateString() === new Date().toLocaleDateString() ? 'Сегодня' : 'Вчера'} - Раунд {curr.stage + 1} / 5</p>
                  </Tooltip>
                  <p>Счёт - {curr.score}</p>
                  <p>Время - {curr.time}s</p>
                </div>
              ) 
            })}
          </div>
          {currGames.length < 1 && <h4>У вас нет начатых игр</h4>}
          {currGames.length >= 1 && <Alert variant={AlertVariant.warning} title='Успей закончить игры!'>Незаконченные игры удаляются через 2 дня с момента начала игры.</Alert>}
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
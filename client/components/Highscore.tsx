import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import { getFriendsHighScore, getHighscore } from '../api/mapAPI';
import { useTypedSelector } from '../hooks/useTypedSelector';
import styles from '../styles/Highscore.module.scss'
import SwitchSelector from './UI/SwitchSelector';

interface HighscoreProps {
  map: number
}

const Highscore : React.FC<HighscoreProps> = ({map}) => {
  const [highScore, setHighScore] = useState([])
  const [razdel, setRazdel] = useState(false)
  const [friends, setFriends] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [loadedFriends, setLoadedFriends] = useState(false)

  useEffect(() => {
    getHighscore(map).then((res) => setHighScore(res)).finally(() => setLoaded(true))
    getFriendsHighScore({mapId:map}).then(res => setFriends(res)).finally(() => setLoadedFriends(true))
  }, [])

  return (
    <div className={styles.highScoreContainer}>
      <h1>Рекорды</h1>
      <SwitchSelector props={[{name: 'Все', onClick: () => setRazdel(false), checked: true}, {name: 'Друзья', onClick: () => setRazdel(true)}]}/>
      <div className={styles.tableContainer} style={{gridTemplateRows: '1fr', paddingBottom: '0px'}}>
        <div></div>
        <div></div>
        <div style={{color:'grey', fontWeight:'bold'}} className={styles.score}>Счёт</div>
        <div style={{color:'grey', fontWeight:'bold'}} className={styles.score}>Время</div>
      </div>
      <hr />
      <div className={styles.scoreContainer}>
        {loaded && loadedFriends ? (
          <div className={styles.tableContainer}>
            <>
              {highScore.length === 0 && <h2>Никто ещё не прошёл эту карту. Будь первым!</h2>}
              {razdel === false && highScore.map((h, i) => 
                  <Fragment key={h.id}>
                    <div>{i + 1 + '.'}</div>
                    <div style={{cursor:'pointer'}}>
                      <Link href={`/profile/${h.user.name}`}> 
                        <a>
                          <Image src={`${process.env.REACT_APP_API_URL}/user/${h.user.avatar}`} layout='fixed' width='40px' height='40px' />
                          {h.user.name}
                        </a>
                      </Link>
                    </div>
                    <div className={styles.score}>{h.score}</div>
                    <div className={styles.score}>{h.time} сек</div>
                  </Fragment>
              )}
              {razdel && friends.length === 0 && <h2>Ваши друзья ещё не играли на этой карте</h2>}
              {razdel && friends.map((h, i) => 
                <Fragment key={h.name}>
                  <div>{i + 1 + '.'}</div>
                  <div style={{cursor:'pointer'}}>
                    <Link href={`/profile/${h.name}`}> 
                      <a>
                        <Image src={`${process.env.REACT_APP_API_URL}/user/${h.avatar}`} layout='fixed' width='40px' height='40px' />
                        {h.name}
                      </a>
                    </Link>
                  </div>
                  <div className={styles.score}>{h.score}</div>
                  <div className={styles.score}>{h.time} сек</div>
                </Fragment>
              )}
            </>
          </div>
        ) : (
          <div className='loader'></div>
        )}
      </div>
      <hr />
    </div>
  )
}

export default Highscore

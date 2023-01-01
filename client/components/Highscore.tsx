import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import { getHighscore } from '../api/mapAPI';
import styles from '../styles/Highscore.module.scss'
import SwitchSelector from './UI/SwitchSelector';

interface HighscoreProps {
    map: number
}

const Highscore : React.FC<HighscoreProps> = ({map}) => {
    const [highScore, setHighScore] = useState([])
    const [razdel, setRazdel] = useState(false)
    const [friends, setFriends] = useState([])

    useEffect(() => {
        getHighscore(map).then((res) => setHighScore(res))
    }, [])

    useEffect(() => {
      console.log(highScore)
    }, [highScore])

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
        {highScore.length ? (
          <div className={styles.tableContainer}>
            {highScore.map((h, i) => 
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

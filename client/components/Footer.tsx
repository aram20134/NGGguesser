import React, { useEffect, useState } from 'react'
import styles from '../styles/Footer.module.scss'
import { useTypedSelector } from './../hooks/useTypedSelector';

const Footer : React.FC = () => {
  const {socket, sockets} = useTypedSelector(st => st.socket)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setLoaded(true)
    }, 300);
  }, [sockets, socket])

  if (!loaded || socket === undefined || sockets === undefined) {
    return (
      <>
      <hr />
      <div className={styles.footer}>
        Загрузка игроков.
      </div>
      </>
    )
  }

  if (!socket.id) {
    return (
      <>
      <hr />
      <div className={styles.footer}>
        Обнаружена дополнительная вкладка! Функционал сайта ограничен.
      </div>
      </>
    )
  }

  return (
    <>
     <hr />
     <div className={styles.footer}>
        Игроков на сайте {sockets !== undefined && Object.values(sockets).length}
     </div>
    </>
  )
}

export default Footer
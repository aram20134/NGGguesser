import React, { useEffect, useState } from 'react'
import { useSocket } from '../hooks/useSocket';
import styles from '../styles/Footer.module.scss'
import { useTypedSelector } from './../hooks/useTypedSelector';

const Footer : React.FC = () => {
  const {socket, sockets} = useTypedSelector(st => st.socket)
  console.log(sockets)

  if (sockets === undefined) {
    return ( 
      <>
      <hr />
      <div className={styles.footer}>
        Обнаружена дополнительная вкладка! Функционал сайта ограничен.
      </div>
      </>
    )
  }

  if (socket.id === "") {
    return (
      <>
      <hr />
      <div className={styles.footer}>
        Загрузка игроков
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
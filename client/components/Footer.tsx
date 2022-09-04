import React, { useEffect, useState } from 'react'
import styles from '../styles/Footer.module.scss'
import { useTypedSelector } from './../hooks/useTypedSelector';

const Footer : React.FC = () => {
  const {sockets} = useTypedSelector(st => st.socket)

  return (
    <>
     <hr />
     <div className={styles.footer}>
        Игроков на сайте {Object.values(sockets).length}
     </div>
    </>
  )
}

export default Footer
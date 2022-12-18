import styles from '../styles/Footer.module.scss'
import { useTypedSelector } from './../hooks/useTypedSelector';
import Alert, { AlertVariant } from './UI/Alert';

const Footer : React.FC = () => {
  const {socket, sockets} = useTypedSelector(st => st.socket)  

  if (socket.id === "") {
    return (
      <>
      <hr />
      <div className={styles.footer}>
        Загрузка игроков <span className='mini-loader' style={{width:'30px', height: '30px'}}></span>
      </div>
      </>
    )
  } else if (socket.disconnected) {
    return ( 
      <>
      <hr />
      <div className={styles.footer}>
        <Alert variant={AlertVariant.danger} title='Ошибка'>Обнаружена дополнительная вкладка! Функционал сайта ограничен.</Alert>
      </div>
      </>
    )
  } else {
    return (
      <>
       <hr />
       <div onClick={() => console.log(socket)} className={styles.footer}>
          Игроков на сайте {sockets !== undefined && Object.values(sockets).length}
       </div>
      </>
    )
  }

}

export default Footer
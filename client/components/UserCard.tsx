import styles from "../styles/UserCard.module.scss";
import Image from 'next/image';
import { userState } from './../types/user';
import Link from "next/link";
import { setAdminUser } from "../api/adminAPI";
import { useTypedSelector } from "../hooks/useTypedSelector";
import { useEffect, useState } from "react";
import Tooltip from "./UI/Tooltip";

interface UserCardProps {
    user: userState;
    adminMode?: boolean;
    friends?: Object;
    withFriends?: boolean;
}

const UserCard : React.FC<UserCardProps> = ({user, adminMode, friends, withFriends}) => {
    const {socket, sockets} = useTypedSelector(st => st.socket) as any
    const u = useTypedSelector(st => st.user)
    const [alive, setAlive] = useState(false)
    const [send, setSend] = useState(false)

    useEffect(() => {
      if (socket.connected) {
        for (let i = 0; i < sockets?.length; i++) {
            if (sockets[i].user.id === user.id) {
                setAlive(true)
                break
            } else {
                setAlive(false)
            }
          }
      }
    }, [sockets])
    
    const setAdmin = () => {
        user.role = 'ADMIN'
        setAdminUser({id: user.id, role:'ADMIN'})
    }

    const setUser = () => {
        user.role = 'USER'
        setAdminUser({id: user.id, role:'USER'})
    }

    const addFriend = () => {
        if (alive) {
            setSend(true)
            socket.emit('ADD_FRIEND', {to: user.id, from: u.id})
        }
    }

    return adminMode ? (
        <div style={{border: user.role === "ADMIN" && '2px solid darkred'}} className={styles.user}>
            <div className={styles.userUpper}>
            <Link target='_blank' href={`/profile/${user.name}`}>
                <a target='_blank' className={styles.profile}>
                    <Image src={`${process.env.REACT_APP_API_URL}/user/${user.avatar}`} width={'100%'} height={'100%'} /> 
                    <h4 style={{color: user.role === "ADMIN" && 'darkred'}}>{user.name}</h4>
                </a>
            </Link>
            <p>{'Уровень: ' + user.level}</p>
            <p>{'Опыт: ' + user.exp}</p>
            <p>{'Игр: ' + user.userMapPlayeds.length}</p>
            <p>{'Регистрация: ' + new Date(user.createdAt).toLocaleDateString()}</p>
            <p className={styles.status}>{'Статус: '}<div className={alive ? styles.online : styles.offline}></div></p>
            <div className={styles.buttonRazdel}>
                {user.role === "USER" 
                ? <button onClick={(e) => setAdmin()} className={styles.buttonChange}>Сделать Админом</button> 
                : <button onClick={(e) => setUser()} className={styles.buttonChange}>Сделать Юзером</button>
                }
                <button className={styles.buttonDelete}>Удалить</button>
            </div>
            </div>
        </div>
    ) : (
        <div className={styles.user}>
            <div className={styles.userUpper}>
                <Link target='_blank' href={`/profile/${user.name}`}>
                    <a target='_blank' className={styles.profile}>
                        <Image src={`${process.env.REACT_APP_API_URL}/user/${user.avatar}`} width={'100%'} height={'100%'} /> 
                        <h4>{user.name}</h4>
                    </a>
                </Link>
                <p>
                    <Tooltip classN={styles.status} title={alive ? 'В сети' : 'Не в сети'}>
                        Статус<div className={alive ? styles.online : styles.offline}></div>
                    </Tooltip>
                </p>
                {withFriends && 
                    <p>
                        {friends ? (
                            <button className={styles.buttonChange + ' ' + styles.notActive}>Уже ваш друг</button>                
                        ) : (
                            send ? (
                                <button style={{border: '2px solid green'}} className={styles.buttonChange + ' ' + styles.notActive}>Приглашение отправлено</button>
                            ) : (
                                <button onClick={addFriend} className={alive ? styles.buttonChange : styles.buttonChange + ' ' + styles.notActive}>Отправить приглашение</button>
                            )
                        )}
                    </p>
                }
            </div>
        </div>
    )
} 
export default UserCard
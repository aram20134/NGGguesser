import styles from "../styles/UserCard.module.scss";
import Image from 'next/image';
import { userState } from './../types/user';
import Link from "next/link";

interface UserCardProps {
    user: userState;
}

const UserCard : React.FC<UserCardProps> = ({user}) => {
    return (
        <Link href={`/profile/${user.name}`}>
            <a className={styles.user} style={{border: user.role === "ADMIN" && '2px solid darkred'}}>
                <div className={styles.userUpper}>
                    <Image src={`${process.env.REACT_APP_API_URL}/user/${user.avatar}`} width={'100%'} height={'100%'} /> 
                    <h4 style={{color: user.role === "ADMIN" && 'darkred'}}>{user.name}</h4>
                    <p>{'Уровень: ' + user.level}</p>
                    <p>{'Опыт: ' + user.exp}</p>
                    <p>{'Регистрация: ' + new Date(user.createdAt).toLocaleDateString()}</p>
                    <div className={styles.buttonRazdel}>
                        {user.role === "USER" 
                        ? <button className={styles.buttonChange}>Сделать Админом</button> 
                        : <button className={styles.buttonChange}>Сделать Юзером</button>
                        }
                        <button className={styles.buttonDelete}>Удалить</button>
                    </div>
                </div>
            </a>
        </Link>
    )
}
export default UserCard
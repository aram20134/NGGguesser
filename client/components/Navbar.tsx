import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Navbar.module.scss'
import { useTypedSelector } from './../hooks/useTypedSelector';
import MyButton, { ButtonVariant } from './UI/MyButton';
import MyButtonLink from './UI/MyButtonLink';

const Navbar : React.FC = () => {
  const {auth, name} = useTypedSelector(state => state.user)
  const user = useTypedSelector(state => state.user)
  const avatar = user.avatar === "userNoImage.png" ? user.avatar.split('.').shift() + '.svg' : user.avatar
  const router = useRouter()

  return router.pathname === '/' ? (
    <nav className={styles.header}>
        <div className={styles.navbar}>
            <Link href='/'>NGG GUESSER</Link>
            {auth === false 
            ? <Link href='/signin'>Вход</Link> 
            : <Link href={`/profile/${name}`}><a className={styles.profile}><Image src={`${process.env.REACT_APP_API_URL}/user/${avatar}`} width='50px' height='50px' /> {name}</a></Link> 
            }
        </div>
    </nav>
  ) : (
    <nav className={styles.header}>
        <div className={styles.navbar}>
            <Link href='/'>NGG GUESSER</Link>
            {auth === false 
            ? <div style={{display:'flex', flexDirection:'row', gap:'15px'}}>
                <MyButtonLink link='/signup' variant={ButtonVariant.primary}>Регистрация</MyButtonLink>
                <MyButtonLink link='/signin' variant={ButtonVariant.outlined}>Вход</MyButtonLink>
            </div>
            : <Link href={`/profile/${name}`}><a className={styles.profile}><Image src={`${process.env.REACT_APP_API_URL}user/${avatar}`} width='50px' height='50px' /> {name}</a></Link> 
            }
        </div>
    </nav>
  )
}

export default Navbar;
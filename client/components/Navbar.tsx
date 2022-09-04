import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react'
import styles from '../styles/Navbar.module.scss'
import { useActions } from './../hooks/useActions';
import { useTypedSelector } from './../hooks/useTypedSelector';
import MyButton, { ButtonVariant } from './UI/MyButton';
import MyButtonLink from './UI/MyButtonLink';

const Navbar : React.FC = () => {
  const {auth, name} = useTypedSelector(state => state.user)
  const user = useTypedSelector(state => state.user)

  const router = useRouter()

  return router.pathname === '/' ? (
    <nav className={styles.header}>
        <div className={styles.navbar}>
            <Link href='/'>NGG GUESSER</Link>
            {auth === false 
            ? <Link href='/signin'>Вход</Link> 
            : <Link href='/profile'>{name}</Link> 
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
            : <Link href='/profile'>{name}</Link> 
            }
        </div>
    </nav>
  )
}

export default Navbar;
import type { GetStaticProps, NextPage } from 'next'
import { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import MainContainer from '../components/MainContainer'
import { useActions } from './../hooks/useActions';
import { useTypedSelector } from './../hooks/useTypedSelector';
import Link from 'next/link';
import MyButton, { ButtonVariant } from './../components/UI/MyButton';
import anaxes from '../public/anaxes.png'
import cl1 from '../public/clone1.png'
import cl2 from '../public/clone2.png'
import medal from '../public/medal.png'
import MyButtonLink from '../components/UI/MyButtonLink';
import { users } from '../api/userAPI';
import Image from 'next/image';
import styles from '../styles/Index.module.scss'
import IndexAuth from '../components/IndexAuth';


const Index = ({users}) => {
  const user = useTypedSelector(st => st.user)

  return !user.auth ? (
    <MainContainer title='NGG GUESSER'>
      <div className={styles.background}>
        <div className={styles.background3}></div>
      </div>
      <div className={styles.background2}></div>
      <main className={styles.main}>
        <div>
          <h1>ИЗУЧАЙ КАРТЫ!</h1>
          <p>Покажи свои знания карт. <br /> Соревнуйся с другими игроками, чтобы доказать свои знания! </p>
          <p>С нами уже {users.users} игроков!</p>
        </div>
        <div>
            <MyButtonLink link='signup' variant={ButtonVariant.primary}>Играть</MyButtonLink>
        </div>
        <main className={styles.teasers}>
          <div className={styles.teaser}>
            <div>
              <h2>Изучай карты</h2>
              <p>Изучай карты в своём темпе и набирай как можно больше очков.</p>
            </div>
            <Image alt='anaxes' src={anaxes} priority />
          </div>
          <hr />
          <div className={styles.teaser}>
            <div style={{display:'flex', flexDirection:'row'}}>
              <img alt='clone phase1' className={styles.img2} src={cl1.src} />
              <img alt='clone phase2' className={styles.img2} src={cl2.src} />
            </div>
            <div>
              <h2>Играй с друзьями</h2>
              <p>Сорвенуйся против своих друзей. Докажи кто здесь лучший!</p>
            </div>
          </div>
          <hr />
          <div className={styles.teaser}>
            <div>
              <h2>Соревнуйся с другими</h2>
              <p>Проверь свои способности с разными игроками. Поднимайся по таблице! </p>
            </div>
            <Image alt='medal' src={medal} />
          </div>
        </main>
      </main>
    </MainContainer>
  ) : (
    <MainContainer title='NGG GUESSER'>
      <IndexAuth />
    </MainContainer>
  )
}

export default Index

export async function getStaticProps(context : GetStaticProps) {
  const response = await users()
  return {
    props: {users:response}
  }
}
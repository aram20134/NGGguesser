import type { NextPage } from 'next'
import MainContainer from '../components/MainContainer'
import { useTypedSelector } from './../hooks/useTypedSelector';
import { ButtonVariant } from './../components/UI/MyButton';
import anaxes from '../public/anaxes.png'
import cl1 from '../public/clone1.png'
import cl2 from '../public/clone2.png'
import medal from '../public/medal.png'
import MyButtonLink from '../components/UI/MyButtonLink';
import { usersCount } from '../api/userAPI';
import Image from 'next/image';
import styles from '../styles/Index.module.scss'
import IndexAuth from '../components/IndexAuth';
import { GetServerSideProps } from 'next';
import {NextThunkDispatch, wrapper} from '../store';
import { setMaps } from '../store/actions/map';
import { setUserProps } from '../store/actions/user';

interface IndexProps {
  users: number;
  test: any
}

const Index : NextPage<IndexProps> = ({users}) => {
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
          <p>Покажи свои знания карт. <br /> Соревнуйся c другими игроками, чтобы доказать свои знания! </p>
          <p>C нами уже {users} игроков!</p>
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
            <Image loading='lazy' alt='anaxes' src={anaxes} />
          </div>
          <hr />
          <div className={styles.teaser}>
            <div style={{display:'flex', flexDirection:'row'}}>
              <img loading='lazy' alt='clone phase1' className={styles.img2} src={cl1.src} />
              <img loading='lazy' alt='clone phase2' className={styles.img2} src={cl2.src} />
            </div>
            <div>
              <h2>Играй c друзьями</h2>
              <p>Сорвенуйся против своих друзей. Докажи кто здесь лучший!</p>
            </div>
          </div>
          <hr />
          <div className={styles.teaser}>
            <div>
              <h2>Соревнуйся c другими</h2>
              <p>Проверь свои способности c разными игроками. Поднимайся по таблице! </p>
            </div>
            <Image loading='lazy' alt='medal' src={medal} />
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

export const getServerSideProps : GetServerSideProps = wrapper.getServerSideProps(store => async ({req, res}) => {
  const dispatch = store.dispatch as NextThunkDispatch
  await dispatch(setUserProps(req.cookies.token))
  
  const {users} = await usersCount()

  return {
    props: {users}
  }
})  
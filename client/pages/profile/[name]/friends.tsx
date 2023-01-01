import { GetServerSideProps, NextPage } from 'next'
import { useEffect, useState } from 'react'
import { NextThunkDispatch, wrapper } from '../../../store'
import { setUserProps } from '../../../store/actions/user'
import { useTypedSelector } from './../../../hooks/useTypedSelector';
import styles from '../../../styles/Friends.module.scss'
import MainContainer from '../../../components/MainContainer';
import { findUser, searchUsers } from '../../../api/userAPI';
import UserCard from '../../../components/UserCard';
import SwitchSelector from '../../../components/UI/SwitchSelector';
import MyInput from '../../../components/UI/MyInput';
import Alert, { AlertVariant } from '../../../components/UI/Alert';

const Friends : NextPage = () => {
  const user = useTypedSelector(st => st.user)
  const {socket, sockets} = useTypedSelector(st => st.socket)
  const [friends, setFriends] = useState([])
  const [userFriends, setUserFriends] = useState([])
  const [queryFriends, setQueryFriends] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [razdel, setRazdel] = useState(true)
  const [search, setSearch] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)
  const [first, setFirst] = useState(true)

  useEffect(() => {
    setUserFriends([])
    let timer = setTimeout(() => {
      findUser(user.id).then(res => setFriends(res.friends)).finally(() => setLoaded(true))
    }, 100)
    return () => clearTimeout(timer)
  }, [sockets])
  
  useEffect(() => {
    friends.map(async (f) => {
      var user = await findUser(f.friendId)
      setUserFriends(prev => [...prev, user])
    })
  }, [friends])

  useEffect(() => {
    let timer = setTimeout(() => {
      search && setFirst(false)
      search && setSearchLoading(true)
      search && searchUsers(search).then(res => setQueryFriends(res.filter((u) => u.id !== user.id))).finally(() => setSearchLoading(false))
    }, 400)

    return () => {
      clearTimeout(timer)
    }
  }, [search])
  

  if (!loaded) {
    return (
      <MainContainer title='Друзья'>
      <div className={styles.bg}></div>
      <main className={styles.friends}>
        <div className={styles.friendsContainer}>
          <h1>Друзья</h1>
          <div className='loader'></div>
        </div>
      </main>
    </MainContainer>
    )
  }
  
  return (
    <MainContainer title='Друзья'>
      <div className={styles.bg}></div>
      <main className={styles.friends}>
        <div className={styles.friendsContainer}>
          <h1>Друзья</h1>
          <SwitchSelector props={[{name: 'Мои друзья', onClick: () => setRazdel(true), checked: true}, {name: 'Найти друга', onClick: () => setRazdel(false)}]} />
          {razdel ? (
            <div className={styles.friendsBox}>
              {friends.length >= 1 ? (
              <div className={styles.friendsBox}>
                {userFriends.map((f) => 
                  <UserCard key={f.id} user={f} />
                )}
              </div>
            ) : (
              <h3>У вас пока нет друзей</h3>
            )}
            </div>
          ) : (
            <div style={{gap:'25px', display:'flex', flexDirection:'column'}}>
              <MyInput myStyle={{width:'100%'}} type='text' value={search} setValue={(e) => setSearch(e.target.value)} title='Поиск друга' description='Введите ник'  />
              <Alert variant={AlertVariant.warning} title='Внимание'>Добавлять можно только тех игроков, которые находяться в сети</Alert>
              <div className={styles.friendsBox}>
                {searchLoading && <div className='loader'></div>}
                {!searchLoading && queryFriends.map((q) => 
                  <UserCard withFriends friends={friends.filter(f => f.friendId === q.id)[0]} user={q} key={q.id} />
                )}
                {!first && !searchLoading && queryFriends.length === 0 && <h3>Игроков не найдено</h3>}
              </div>
            </div>
          )}
          
        </div>
      </main>
    </MainContainer>
  )
}

export default Friends


export const getServerSideProps : GetServerSideProps = wrapper.getServerSideProps(store => async ({req, res, query}) => {
  const dispatch = store.dispatch as NextThunkDispatch

  await dispatch(setUserProps(req.cookies.token))
  var {user} = store.getState()
  var param = query.name


  if (param !== user.name) {
    return {
      notFound: true
    }
  }
  
  return {
    props: {}
  }
})
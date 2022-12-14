import { GetServerSideProps, NextPage } from 'next'
import { useEffect, useState } from 'react'
import { NextThunkDispatch, wrapper } from '../../../store'
import { setUserProps } from '../../../store/actions/user'
import { useTypedSelector } from './../../../hooks/useTypedSelector';
import styles from '../../../styles/Friends.module.scss'
import MainContainer from '../../../components/MainContainer';
import { delFriend, findUser, getFriends, searchUsers } from '../../../api/userAPI';
import UserCard from '../../../components/UserCard';
import SwitchSelector from '../../../components/UI/SwitchSelector';
import MyInput from '../../../components/UI/MyInput';
import Alert, { AlertVariant } from '../../../components/UI/Alert';

const Friends : NextPage = () => {
  const user = useTypedSelector(st => st.user)
  const {socket, sockets} = useTypedSelector(st => st.socket) as any
  // const [friends, setFriends] = useState([])
  const [userFriends, setUserFriends] = useState([])
  const [queryFriends, setQueryFriends] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [razdel, setRazdel] = useState(true)
  const [search, setSearch] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)
  const [first, setFirst] = useState(true)
  const [updateState, setUpdateState] = useState(false)

  useEffect(() => {
    getFriends().then(res => setUserFriends(res)).finally(() => setLoaded(true))
  }, [socket, updateState])
  
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

  const delFriends = (id) => {
    setUserFriends(prev => prev.filter((f) => id !== f.id))
    delFriend(id).then((res) => console.log(res))
    if (socket.connected) {
      socket.emit('FRIEND_DELETED', (id))
    }
  }

  useEffect(() => {
    if (socket.connected) {
      socket.on('FRIEND_DELETED', () => {
        console.log('deleted')
        setUpdateState(!updateState)
      })
      socket.on('ADDED_FRIEND', () => {
        console.log('update')
        setUpdateState(!updateState)
      })
    }
  }, [socket])
  

  if (!loaded) {
    return (
      <MainContainer title='????????????'>
      <div className={styles.bg}></div>
      <main className={styles.friends}>
        <div className={styles.friendsContainer}>
          <h1>????????????</h1>
          <div className='loader'></div>
        </div>
      </main>
    </MainContainer>
    )
  }
  
  return (
    <MainContainer title='????????????'>
      <div className={styles.bg}></div>
      <main className={styles.friends}>
        <div className={styles.friendsContainer}>
          <h1>????????????</h1>
          <SwitchSelector props={[{name: '?????? ????????????', onClick: () => setRazdel(true), checked: true}, {name: '?????????? ??????????', onClick: () => setRazdel(false)}]} />
          {razdel ? (
            <div className={styles.friendsBox}>
              {userFriends.length >= 1 ? (
              <div className={styles.friendsBox}>
                {userFriends.map((f) => 
                  <UserCard delFriends={delFriends} key={f.id} user={f} />
                )}
              </div>
            ) : (
              <h3>?? ?????? ???????? ?????? ????????????</h3>
            )}
            </div>
          ) : (
            <div style={{gap:'25px', display:'flex', flexDirection:'column'}}>
              <MyInput myStyle={{width:'100%'}} type='text' value={search} setValue={(e) => setSearch(e.target.value)} title='?????????? ??????????' description='?????????????? ??????'  />
              <Alert variant={AlertVariant.warning} title='????????????????'>?????????????????? ?????????? ???????????? ?????? ??????????????, ?????????????? ???????????????????? ?? ????????</Alert>
              <div className={styles.friendsBox}>
                {searchLoading && <div className='loader'></div>}
                {!searchLoading && queryFriends.map((q) => 
                  <UserCard withFriends friends={userFriends.filter(f => f.id === q.id)[0]} user={q} key={q.id} />
                )}
                {!first && !searchLoading && queryFriends.length === 0 && <h3>?????????????? ???? ??????????????</h3>}
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
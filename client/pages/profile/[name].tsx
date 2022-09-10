import { GetServerSideProps, NextPage } from 'next'
import React, { useEffect } from 'react'
import MainContainer from '../../components/MainContainer'
import { NextThunkDispatch, wrapper } from '../../store'
import { setMaps } from '../../store/actions/map'
import { setUserProps } from '../../store/actions/user'
import { useRouter } from 'next/router';
import styles from '../../styles/profile[name].module.scss'
import { users } from '../../api/userAPI'
import { useSocket } from './../../hooks/useSocket';

const Name : NextPage = () => {
  const router = useRouter()
  const socket = useSocket()

  useEffect(() => {
  
  }, [])
  
  return (
    <MainContainer title={`Профиль ${router.query.name}`}>
      <main className={styles.profile}>
        <div className={styles.bg}></div>
      </main>
    </MainContainer>
  )
}

export default Name

export const getServerSideProps : GetServerSideProps = wrapper.getServerSideProps(store => async ({req, res, query}) => {
    const dispatch = store.dispatch as NextThunkDispatch

    await dispatch(setMaps())
    await dispatch(setUserProps(req.cookies.token))
    var {user, map} = store.getState()
    var param = query.name
    var response = await users()
    response = response.users.filter((u) => u.name === param ? true : false)[0]

    if (!response) {
      return {
        notFound: true
      }
    }
    if (!user.auth) {
      return {
        redirect: {destination: '/', permanent: true}
      }
    }
    
    return {
      props: {response}
    }
  })
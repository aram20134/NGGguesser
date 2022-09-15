import { GetServerSideProps, NextPage } from 'next'
import React, { useEffect } from 'react'
import MainContainer from '../../../components/MainContainer'
import { NextThunkDispatch, wrapper } from '../../../store'
import { setUserProps } from '../../../store/actions/user'
import styles from '../../../styles/MapLiked.module.scss'
import { useState } from 'react';
import { useTypedSelector } from './../../../hooks/useTypedSelector';
import { getUserLikes } from '../../../api/userAPI'
import { Ilikes } from '../../../types/map'
import MapChapter from '../../../components/MapChapter'
import { setMaps } from '../../../store/actions/map'

interface mapLikesProps {
  likes: Ilikes[];
}

const mapLiked : NextPage<mapLikesProps> = ({likes}) => {
  const [isLiked, setisLiked] = useState()
  useEffect(() => {
    console.log(likes);
  }, [])

  return (
    <MainContainer title='Понравившиеся карты'>
      <main className={styles.mapLiked}>
        <div className={styles.bg}></div>
        <div className={styles.mapLikedContainer}>
          <h1>Понравившиеся карты</h1>
            <MapChapter title='PHASE 1' phase={1} likes={likes} />
            <MapChapter title='PHASE 2' phase={2} likes={likes} />
        </div>
      </main>
    </MainContainer>
  )
}

export default mapLiked


export const getServerSideProps : GetServerSideProps = wrapper.getServerSideProps(store => async ({req, res, query}) => {
  const dispatch = store.dispatch as NextThunkDispatch

  await dispatch(setUserProps(req.cookies.token))
  await dispatch(setMaps())
  var {user, map} = store.getState()
  var param = query.name
  const {userLikes} = await getUserLikes(user.id)

  if (param !== user.name) {
    return {
      notFound: true
    }
  }
  
  return {
    props: {user: param, likes: userLikes}
  }
})
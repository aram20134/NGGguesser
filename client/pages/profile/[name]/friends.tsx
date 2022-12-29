import { GetServerSideProps, NextPage } from 'next'
import React, { useEffect } from 'react'
import { NextThunkDispatch, wrapper } from '../../../store'
import { setUserProps } from '../../../store/actions/user'
import { useTypedSelector } from './../../../hooks/useTypedSelector';

const Friends : NextPage = () => {
  const user = useTypedSelector(st => st.user)
  useEffect(() => {
    console.log(user);
  }, [])
  
  return (
    <div>friends</div>
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
    props: {user: param}
  }
})
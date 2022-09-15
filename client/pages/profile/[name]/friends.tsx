import { GetServerSideProps, NextPage } from 'next'
import React, { useEffect } from 'react'
import { NextThunkDispatch, wrapper } from '../../../store'
import { setUserProps } from '../../../store/actions/user'

const friends : NextPage = () => {

  return (
    <div>games</div>
  )
}

export default friends


export const getServerSideProps : GetServerSideProps = wrapper.getServerSideProps(store => async ({req, res, query}) => {
  const dispatch = store.dispatch as NextThunkDispatch

  await dispatch(setUserProps(req.cookies.token))
  var {user, map} = store.getState()
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
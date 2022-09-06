import { GetServerSideProps } from 'next'
import React from 'react'
import { NextThunkDispatch, wrapper } from '../../store'
import { setMaps } from '../../store/actions/map'
import { setUserProps } from '../../store/actions/user'

const Name : React.FC = () => {
  return (
    <div>name</div>
  )
}

export default Name

export const getServerSideProps : GetServerSideProps = wrapper.getServerSideProps(store => async ({req, res, query}) => {
    const dispatch = store.dispatch as NextThunkDispatch

    await dispatch(setMaps())
    await dispatch(setUserProps(req.cookies.token))
    var {user, map} = store.getState()
    var param = query.name

    // console.log(variantMaps)
    // var mapGame = map.maps.filter((m) => m.id === variantMaps[0].id)
    
    // if (!check) {
    //   return {
    //     notFound: true
    //   }
    // }
    if (!user.auth) {
      return {
        redirect: {destination: '/', permanent: true}
      }
    }
    
    return {
      props: {}
    }
  })
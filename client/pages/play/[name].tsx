import { GetServerSideProps } from 'next'
import Image from 'next/image'
import React, { useEffect } from 'react'
import { NextThunkDispatch, wrapper } from '../../store'
import { setMaps } from '../../store/actions/map'
import { setUserProps } from '../../store/actions/user'

const play = ({variantMap}) => {
    useEffect(() => {
        console.log(variantMap);
    }, [])

  return (
    <div>
      <Image src={`${process.env.REACT_APP_API_URL}/variantMaps/${variantMap.image}`} width='100px' height='100px' />
    </div>
  )
}

export default play

export const getServerSideProps : GetServerSideProps = wrapper.getServerSideProps(store => async ({req, res, query}) => {
    const dispatch = store.dispatch as NextThunkDispatch
  
    await dispatch(setMaps())
    await dispatch(setUserProps(req.cookies.token))
    const {map, user} = store.getState()
    const param = query.name
    // const check = map.maps.filter((m) => m.variantMaps)
    for (let i = 0; i < map.maps.length; i++) {
      for (let j = 0; j < map.maps[i].variantMaps.length; j++) {
          if (map.maps[i].variantMaps[j].name === param) {
            var check = map.maps[i].variantMaps[j]
          }
      }
    }
 
    if (!check) {
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
      props: {variantMap: check}
    }
  })
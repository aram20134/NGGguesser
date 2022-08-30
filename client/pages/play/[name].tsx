import { GetServerSideProps } from 'next'
import Image from 'next/image'
import React, { useEffect } from 'react'
import MainContainer from '../../components/MainContainer'
import { NextThunkDispatch, wrapper } from '../../store'
import { setMaps } from '../../store/actions/map'
import { setUserProps } from '../../store/actions/user'
import styles from '../../styles/Name[id].module.scss'
import { Viewer } from 'photo-sphere-viewer';
import anaxes from '../../public/anaxes.png'
import PositionPicker from '../../components/PositionPicker'
import { Imap, IvariantMaps, mapState } from '../../types/map'

interface playProps {
  variantMap: IvariantMaps;
  map: Imap;
}

const play : React.FC<playProps> = ({map, variantMap}) => {
    useEffect(() => {

        console.log(variantMap, map);
        const viewer = new Viewer({
          container: document.querySelector('#viewer') as any,
          panorama: `${process.env.REACT_APP_API_URL}/variantMaps/${variantMap.image}`,
          fisheye: false,
          defaultZoomLvl: 0,
          navbar: [],
          loadingImg: `${process.env.REACT_APP_API_URL}/map/${map.image}`,
          panoData: {
            fullWidth:3739,
            fullHeight: 1870,
            croppedHeight:977,
            croppedWidth:3739,
            croppedY:447,
            croppedX: 0
          }
        });
    }, [])
    
  return (
    <MainContainer title={`Игра на ${map.name}`}>
      <main className={styles.container}>
        <div className={styles.bg}></div>
        <div id='viewer' style={{width: '100vw', height:'80vh', position: 'relative'}}>
          <div className="mapPicker">
            <PositionPicker map={map} variantMap={variantMap} />
          </div>
        </div>
      </main>
    </MainContainer>
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
            var checkMap = map.maps[i]
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
      props: {variantMap: check, map: checkMap}
    }
  })
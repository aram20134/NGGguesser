import { ReactEventHandler, useEffect, useState } from 'react';
import React from 'react'
import { Imap, IvariantMaps } from '../types/map';
import { url } from 'inspector';
import styles from '../styles/PositionPicker.module.scss'
import clone1 from '../public/clone1.png'
import clone2 from '../public/clone2.png'
import anaxes from '../public/anaxes.png'
import Draggable from 'react-draggable';
import MyButton, { ButtonVariant } from './UI/MyButton';
import { useActions } from '../hooks/useActions';
import { useTypedSelector } from '../hooks/useTypedSelector';
import io from 'socket.io-client';
import { getCookie } from 'cookies-next';

interface PositionPickerProps {
  map: Imap;
  variantMap: IvariantMaps;
}


const PositionPicker : React.FC<PositionPickerProps> = ({map, variantMap})  => {
    const [img, setImg] = useState<{width: number; height: number}>()
    const [load, setLoad] = useState(false)
    const [scale, setScale] = useState(1)
    const [IsChosed, setIsChosed] = useState(false)
    const [choseChecked, setChoseChecked] = useState(false)
    const [choseCoords, setChoseCoords] = useState<{x: number; y: number}>()
    
    const {setSocket} = useActions()
    const user = useTypedSelector(st => st.user)
    var socket
    const padding = 12

    useEffect(() => {
      if (user.name !== 'user') {
        socket = io(process.env.REACT_APP_API_URL, {auth: {token : getCookie('token')}})
      }
    }, [user])

    useEffect(() => {
      if (user.name !== 'user') {
          socket.on('connect', () => {
              socket.emit('USER_ONLINE')
          })
          socket.on('USERS_ONLINE', (data) => {
            setSocket({sockets: data})
          })
      }
      return () => {
        socket.disconnect()
      }
    }, [socket])

    useEffect(() => {
      const getImg = () => {
        const img = new Image()
        img.src = `${process.env.REACT_APP_API_URL}/mapSchema/${map.mapSchema}`
        setImg({width: img.width, height: img.height})
        setLoad(true)
      }
      getImg()
    }, [])

    useEffect(() => {
      if (load) {
        const img = document.getElementById('imageCont')
        const cont = document.getElementById('cont')

        img.onmouseover = () => {
          cont.style.width = '700px'
        }
        img.onmouseleave = () => {
          cont.style.width = '400px'
        }
      }
    }, [load])

    const setChoose = (e : React.MouseEvent) => {
      const target = document.querySelector('#image').getBoundingClientRect()
      const image : HTMLImageElement = document.querySelector('#choose')

      var x = Math.round((e.clientX - target.left) / scale) - image.width / 2 - padding
      var y = Math.round((e.clientY - target.top) / scale) - image.height / 2 - padding

      image.style.visibility = 'visible'
      image.style.transform = `translate(${x}px, ${y}px)`

      setIsChosed(true)
      setChoseCoords({x, y})
      console.log(x, y);
    }

    const checkChoose = (e) => {
      const image : HTMLImageElement = document.querySelector('#trueChoose')
      const image2 : HTMLImageElement = document.querySelector('#choose')

      image2.style.transform = image2.style.transform + 'scale(3)'
      image.style.transform = `translate(${variantMap.posX}px, ${variantMap.posY}px) scale(3)`
      image.style.visibility = 'visible'

      setChoseChecked(true)

      var canvas = document.getElementById("canv") as HTMLCanvasElement
      var ctx = canvas?.getContext("2d") as CanvasRenderingContext2D

      ctx.lineWidth = 5
      ctx.strokeStyle = 'green'
      ctx.setLineDash([10, 10])
      ctx.moveTo(choseCoords.x + padding, choseCoords.y + padding)
      ctx.lineTo(variantMap.posX + padding, variantMap.posY + padding)
      ctx.stroke()

      // Теорема Пифагора
      // a = x1 - x2
      // b = y1 - y2
      // c = sqrt(a*a + b*b)
      const a = choseCoords.x - variantMap.posX
      const b = choseCoords.y - variantMap.posY
      const lineWidth = Math.round(Math.sqrt(a*a + b*b))

      const maxScore = 5000
      var score = maxScore - lineWidth * 4
      if (score < 100) {
        score = 0
      } else if (score > 4500) {
        score = 5000
      }
      console.log(score);
    }

  return load && (
    <div id='cont' className={styles.container}>
        <div id ='imageCont' className={styles.imgPicker}>
        <Draggable handle='#image' defaultPosition={{x: -img.width / 2, y: -img.height / 2}}>
          <div>
            <div id='image' 
              onWheel={(e) => {
                  if (e.deltaY < 0 && scale <= 2.5) {
                    setScale(prev => prev + 0.05)
                  } else if (e.deltaY > 0 && scale >= 0.3) {
                    setScale(prev => prev - 0.05)
                  }
                }
              }
              onDoubleClick={(e) => !choseChecked && setChoose(e)}
              className={styles.img} 
              style={{backgroundImage: `url(${process.env.REACT_APP_API_URL}/mapSchema/${map.mapSchema})`, width: img.width, height: img.height, transform: `scale(${scale})`}}>
              <img id='choose' src={map.phase === 1 ? clone1.src : clone2.src} className={styles.choose} />
              <canvas id='canv' width={img.width} height={img.height}></canvas>
              <img id='trueChoose' src={`${process.env.REACT_APP_API_URL}/map/${map.image}`} className={styles.trueChoose} />
            </div>
          </div>
        </Draggable>
        </div>
        <MyButton disabled={!IsChosed || choseChecked} click={(e) => !choseChecked && checkChoose(e)} myStyle={{width: '100%', zIndex: 200}} variant={ButtonVariant.primary}>Выбрать</MyButton>
    </div>
  )
}

export default PositionPicker
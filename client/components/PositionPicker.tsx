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
import { userAgent } from 'next/server';
import { getCookie } from 'cookies-next';
import { io } from 'socket.io-client';

interface PositionPickerProps {
  map: Imap;
  variantMap: IvariantMaps;
  choseChecked: boolean;
  setScore: Function;
  setChoseChecked: Function;
  setLineWidth: Function;
  setPositions: Function;
  allPositions?: object;
  last?: boolean
  allChoses?: boolean
}


const PositionPicker : React.FC<PositionPickerProps> = ({map, variantMap, setLineWidth,choseChecked, setChoseChecked, setScore, setPositions, allPositions, last = false, allChoses = false})  => {
    const [img, setImg] = useState<{width: number; height: number}>()
    const [load, setLoad] = useState(false)
    const [scale, setScale] = useState(1)
    const [IsChosed, setIsChosed] = useState(false)
    const [choseCoords, setChoseCoords] = useState<{x: number; y: number}>()
    
    const padding = 12

    useEffect(() => {
      const setAllChoses = (allPositions) => {
        if (load) {
          var canvas = document.getElementById("canv") as HTMLCanvasElement
          var ctx = canvas?.getContext("2d") as CanvasRenderingContext2D

          ctx.lineWidth = 5
          ctx.strokeStyle = 'green'
          ctx.setLineDash([10, 10])

          for(let i = 1; i < 5; i++) {
            ctx.moveTo(allPositions[i].posX + padding, allPositions[i].posY + padding)
            ctx.lineTo(allPositions[i].truePosX + padding, allPositions[i].truePosY + padding)
            ctx.stroke()
          }

          for (let i = 1; i < 5; i++) {
            var imgTrueChose = new Image()
            imgTrueChose.src = `${process.env.REACT_APP_API_URL}/map/${map.image}`
            imgTrueChose.className = styles.trueChoose
            imgTrueChose.id = 'TrueChose' + i
            document.getElementById('image').appendChild(imgTrueChose)
            imgTrueChose.style.visibility = 'visible'
            imgTrueChose.style.transform = `translate(${allPositions[i].truePosX}px, ${allPositions[i].truePosY}px) scale(3)`
          }
          for (let i = 1; i < 5; i++) {
            var imgChoose = new Image()
            imgChoose.src = map.phase === 1 ? clone1.src : clone2.src
            imgChoose.className = styles.choose
            imgChoose.id = 'imgChoose' + i
            document.getElementById('image').appendChild(imgChoose)
            imgChoose.style.visibility = 'visible'
            imgChoose.style.left = '0'
            imgChoose.style.transform = `translate(${allPositions[i].posX}px, ${allPositions[i].posY}px) scale(3)`
          }
        }
      }
      if (last) {
        setChoose(undefined, allPositions[5].posX, allPositions[5].posY)
        checkChoose(undefined, allPositions[5].truePosX, allPositions[5].truePosY, allPositions[5].posX, allPositions[5].posY)
        if (allChoses) {
          setAllChoses(allPositions)
        }
      }
    }, [load, allChoses])
    
    

    useEffect(() => {
      
      const getImg = () => {
        const img = new Image()
        img.src = `${process.env.REACT_APP_API_URL}/mapSchema/${map.mapSchema}`
        setImg({width: img.width, height: img.height})
        setLoad(true)
      }
      getImg()
    }, [load])

    useEffect(() => {
      if (load) {
        const img = document.getElementById('imageCont')
        const cont = document.getElementById('cont')

        const onMouseOverStyle = () => {
          cont.style.width = '700px'
        }

        const onMouseLeaveStyle = () => {
          cont.style.width = '400px'
        }

        img.addEventListener('mouseover', onMouseOverStyle)
        img.addEventListener('mouseleave', onMouseLeaveStyle)

        if (choseChecked) {
          img.removeEventListener('mouseover', onMouseOverStyle)
          img.removeEventListener('mouseleave', onMouseLeaveStyle)
        }
        return () => {
          img.removeEventListener('mouseover', onMouseOverStyle)
          img.removeEventListener('mouseleave', onMouseLeaveStyle)
        }
      }
    }, [load, choseChecked])

    const setChoose = (e? : React.MouseEvent, posX?, posY?) => {
      if (!document.querySelector('#image')) return
      const target = document.querySelector('#image').getBoundingClientRect()
      const image : HTMLImageElement = document.querySelector('#choose')
      if (posX && posY) {
        var x : number = posX
        var y : number = posY
      } else {
        var x : number = Math.round((e.clientX - target.left) / scale) - image.width / 2 - padding
        var y : number = Math.round((e.clientY - target.top) / scale) - image.height / 2 - padding
      }
      image.style.visibility = 'visible'
      image.style.transform = `translate(${x}px, ${y}px)`

      setIsChosed(true)
      setChoseCoords({x, y})
      console.log(x, y);
    }

    const checkChoose = (e, truePosX?, truePosY?, LposX?, LposY?) => {
      if (!document.querySelector('#choose')) return
      const image : HTMLImageElement = document.querySelector('#trueChoose')
      const image2 : HTMLImageElement = document.querySelector('#choose')
      
      if (truePosX && truePosY) {
        var posX : number  = truePosX
        var posY : number  = truePosY
      } else {
        var posX : number  = Math.round(variantMap.posX / 9 + map.id * 2)
        var posY : number = Math.round(variantMap.posY / 9 + map.id * 2)
        setPositions({posX: choseCoords.x, posY: choseCoords.y, truePosX: posX, truePosY: posY})
        setChoseChecked(true)
      }
      
      image2.style.transform = image2.style.transform + 'scale(3)'
      image.style.transform = `translate(${posX}px, ${posY}px) scale(3)`
      image.style.visibility = 'visible'
  

      var canvas = document.getElementById("canv") as HTMLCanvasElement
      var ctx = canvas?.getContext("2d") as CanvasRenderingContext2D

      ctx.lineWidth = 5
      ctx.strokeStyle = 'green'
      ctx.setLineDash([10, 10])

      if (LposX && LposY) {
        ctx.moveTo(LposX, LposY)
        ctx.lineTo(posX, posY)
      } else {
        ctx.moveTo(choseCoords.x + padding, choseCoords.y + padding)
        ctx.lineTo(posX + padding, posY + padding)
      }

      ctx.stroke()

      // Теорема Пифагора
      // a = x1 - x2
      // b = y1 - y2
      // c = sqrt(a*a + b*b)
      if (LposX && LposY) {
        var a = LposX - posX
        var b = LposY - posY
      } else {
        var a = choseCoords.x - posX
        var b = choseCoords.y - posY
      }
      const lineWidth = Math.round(Math.sqrt(a*a + b*b))
      setLineWidth(lineWidth)

      const maxScore = 5000
      var score = maxScore - lineWidth * 4 - Math.round(lineWidth / 2)
      if (score < 500) {
        score = 0
      } else if (score > 4500) {
        score = 5000
      }
      setScore(score)
    }
  return load && (
    <div id='cont' className={styles.container}>
        <div id ='imageCont' className={choseChecked ? styles.imgPickerChecked : styles.imgPicker}>
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
        {!choseChecked && <MyButton disabled={!IsChosed || choseChecked} click={(e) => !choseChecked && checkChoose(e)} myStyle={{width: '100%', zIndex: 200}} variant={ButtonVariant.primary}>Выбрать</MyButton>}
    </div>
  )
}

export default PositionPicker
import { useEffect, useState } from 'react';
import React from 'react'
import { Imap, IvariantMaps } from '../types/map';
import styles from '../styles/PositionPicker.module.scss'
import clone1 from '../public/clone1.png'
import clone2 from '../public/clone2.png'
import Draggable from 'react-draggable';
import MyButton, { ButtonVariant } from './UI/MyButton';

interface PositionPickerFriendsProps {
    map: Imap;
    variantMap: IvariantMaps;
    variantMaps: IvariantMaps[];
    setChoseChecked: Function;
    choseChecked: boolean;
    setPositions: Function;
    setLineWidth: Function;
    setScore: Function;
    alreadyChosed: boolean;
    gameEnd: boolean;
    switchStage: number;
    stage: number;
    positions: {posX: number, posY: number, truePosX: number, truePosY: number, name: string};
    friendsChooses: [{posX: number, posY: number, id: number, truePosX: number, truePosY: number, stage: number, score:number, name: string}];
}

const PositionPickerFriends : React.FC<PositionPickerFriendsProps> = ({map, switchStage, gameEnd, variantMap, setChoseChecked, choseChecked, setPositions, setLineWidth, setScore, friendsChooses, stage, positions, alreadyChosed, variantMaps})  => {
    const [IsChosed, setIsChosed] = useState(false)
    const [choseCoords, setChoseCoords] = useState<{x: number; y: number}>()
    const [transform, setTransform] = useState<{posX: number, posY: number}>({posX: 0, posY: 0})
    const [pos, setPos] = useState<{posX: number, posY: number, scale: number}>({posX: 0, posY: 0, scale: 1})
    const [load, setLoad] = useState(false)
    const [img, setImg] = useState<{width: number; height: number}>()

    const padding = 20

    const drawChooses = () => {
      if (!(stage === 4 && gameEnd)) {
        var canvas = document.getElementById("canv") as HTMLCanvasElement
        var ctx = canvas?.getContext("2d") as CanvasRenderingContext2D

        ctx.lineWidth = 5
        ctx.strokeStyle = 'green'
        ctx.setLineDash([10, 10])

        if (gameEnd) {
          for(let i = 1; i < friendsChooses.length; i++) {
            if (friendsChooses[i].stage === stage) {
              ctx.moveTo(friendsChooses[i].posX + padding, friendsChooses[i].posY + padding)
              ctx.lineTo(friendsChooses[i].truePosX + padding, friendsChooses[i].truePosY + padding)
              ctx.stroke()
            }
          }
          var posX : number  = Math.round(variantMap.posX / 9 + map.id * 2) - padding
          var posY : number = Math.round(variantMap.posY / 9 + map.id * 2) - padding

          var imgTrueChose = new Image()
          imgTrueChose.src = `${process.env.REACT_APP_API_URL}/map/${map.image}`
          imgTrueChose.className = styles.trueChoose
          imgTrueChose.id = 'TrueChose'
          imgTrueChose.style.visibility = 'visible'
          imgTrueChose.style.transform = `translate(${posX}px, ${posY}px) scale(2)`
          
          document.getElementById('image').appendChild(imgTrueChose)
        }

        for (let i = 1; i < friendsChooses.length; i++) {
          if (friendsChooses[i].stage === stage) {
            var imgChoose = new Image()
            imgChoose.src = map.phase === 1 ? clone1.src : clone2.src
            imgChoose.className = styles.choose
            imgChoose.id = 'imgChoose'
            imgChoose.style.visibility = 'visible'
            imgChoose.style.left = '0'
            imgChoose.style.transform = `translate(${friendsChooses[i].posX}px, ${friendsChooses[i].posY}px) scale(2)`

            var num = document.createElement('p')
            num.append(`${friendsChooses[i].name}`)
            num.style.position = 'absolute'
            num.style.transform = `translate(${friendsChooses[i].posX}px, ${friendsChooses[i].posY}px) scale(2)`
            num.style.left = '-20px'
            num.style.top = '-20px'

            document.getElementById('image').appendChild(imgChoose)
            document.getElementById('image').appendChild(num)
          }
        }
      } else if (stage === 4 && gameEnd) {
        var canvas = document.getElementById("canv") as HTMLCanvasElement
        var ctx = canvas?.getContext("2d") as CanvasRenderingContext2D
        document.getElementById('choose')?.remove()
        document.getElementById('imgChoose')?.remove()
        
        ctx.lineWidth = 5
        ctx.strokeStyle = 'green'
        ctx.setLineDash([10, 10])
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        for (let i = 0; i < friendsChooses.length; i++) {
          if (friendsChooses[i].stage === switchStage) {
            ctx.beginPath()
            ctx.moveTo(friendsChooses[i].posX + padding, friendsChooses[i].posY + padding)
            ctx.lineTo(friendsChooses[i].truePosX + padding, friendsChooses[i].truePosY + padding)
            ctx.stroke()
          }
        }

        for (let i = 0; i < friendsChooses.length; i++) {
          if (friendsChooses[i].stage === switchStage) {
            var posX : number = Math.round(variantMaps[friendsChooses[i].stage].posX / 9 + map.id * 2) - padding
            var posY : number = Math.round(variantMaps[friendsChooses[i].stage].posY / 9 + map.id * 2) - padding
            
            var imgTrueChose = new Image()
            imgTrueChose.src = `${process.env.REACT_APP_API_URL}/map/${map.image}`
            imgTrueChose.className = styles.trueChoose
            imgTrueChose.id = 'TrueChose' + friendsChooses[i].name
            imgTrueChose.style.visibility = 'visible'
            imgTrueChose.style.transform = `translate(${posX}px, ${posY}px) scale(2)`

            document.getElementById('TrueChose' + friendsChooses[i].name)?.remove()
            
            document.getElementById('image').appendChild(imgTrueChose)
          }
        }

        for (let i = 1; i < friendsChooses.length; i++) {
          if (friendsChooses[i].stage === switchStage) {
            var imgChoose = new Image()
            imgChoose.src = map.phase === 1 ? clone1.src : clone2.src
            imgChoose.className = styles.choose
            imgChoose.id = 'imgChoose' + friendsChooses[i].name
            imgChoose.style.visibility = 'visible'
            imgChoose.style.left = '0'
            imgChoose.style.transform = `translate(${friendsChooses[i].posX}px, ${friendsChooses[i].posY}px) scale(2)`

            var num = document.createElement('p')
            num.append(`${friendsChooses[i].name}`)
            num.style.position = 'absolute'
            num.id = 'name' + friendsChooses[i].name
            num.style.transform = `translate(${friendsChooses[i].posX}px, ${friendsChooses[i].posY}px) scale(2)`
            num.style.left = '-20px'
            num.style.top = '-20px'

            document.getElementById('imgChoose' + friendsChooses[i].name)?.remove()
            document.getElementById('name' + friendsChooses[i].name)?.remove()

            document.getElementById('image').appendChild(imgChoose)
            document.getElementById('image').appendChild(num)
          }
        }

      }
    }

    useEffect(() => {
      if (load && choseChecked) {
        drawChooses()
      }
    }, [friendsChooses, choseChecked, load, gameEnd, switchStage])

    useEffect(() => {
      if (alreadyChosed) {
        setChoseChecked(true)
        // choseCoords && setChoose(undefined, positions.posX, positions.posY)
        // choseCoords && checkChoose(undefined, positions.truePosX, positions.truePosY)
      }
    }, [alreadyChosed, load, positions, choseCoords])

    const setChoose = (e? : React.MouseEvent, posX?, posY?) => {
        if (!document.querySelector('#image')) return
        const target = document.querySelector('#image').getBoundingClientRect()
        const image : HTMLImageElement = document.querySelector('#choose')
        
        if (posX && posY) {
          var x : number = posX
          var y : number = posY
  
          var num = document.createElement('p')
          num.append(`${positions.name}`)
          num.style.position = 'absolute'
          num.style.transform = `translate(${x}px, ${y}px) scale(2)`
          num.style.left = '-20px'
          num.style.top = '-20px'
          document.getElementById('image').appendChild(num)
        } else {
          var x : number = Math.round((e.clientX - target.left) / pos.scale) - image.width / 2 - 12
          var y : number = Math.round((e.clientY - target.top) / pos.scale) - image.height / 2 - 12
        }
        image.style.visibility = 'visible'
        image.style.transform = `translate(${x}px, ${y}px)`
  
        setIsChosed(true)
        setChoseCoords({x, y})
    }

    const checkChoose = (e, truePosX?, truePosY?, LposX?, LposY?) => {
        if (!document.querySelector('#choose')) return
        const image : HTMLImageElement = document.querySelector('#trueChoose')
        const image2 : HTMLImageElement = document.querySelector('#choose')
        
        if (truePosX && truePosY) {
          var posX : number  = truePosX
          var posY : number  = truePosY
          var num = document.createElement('p')
          num.append('')
          num.style.position = 'absolute'
          num.style.transform = `translate(${truePosX}px, ${truePosY}px) scale(2)`
          num.style.left = '-20px'
          num.style.top = '-20px'
          document.getElementById('image').appendChild(num)
        } else {
          var posX : number  = Math.round(variantMap.posX / 9 + map.id * 2) - padding
          var posY : number = Math.round(variantMap.posY / 9 + map.id * 2) - padding
          setPositions({posX: choseCoords.x, posY: choseCoords.y, truePosX: posX, truePosY: posY})
          setChoseChecked(true)
        }

        if (gameEnd) {
          image2.style.transform = image2.style.transform + 'scale(2)'
          image.style.transform = `translate(${posX}px, ${posY}px) scale(2)`
          image.style.visibility = 'visible'
        }
  
        var canvas = document.getElementById("canv") as HTMLCanvasElement
        var ctx = canvas?.getContext("2d") as CanvasRenderingContext2D
  
        ctx.lineWidth = 5
        ctx.strokeStyle = 'green'
        ctx.setLineDash([10, 10])
  
        if (gameEnd) {
            ctx.moveTo(choseCoords.x + padding, choseCoords.y + padding)
            ctx.lineTo(posX + padding, posY + padding)
            ctx.stroke()
        }
  
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
        if (score < 400) {
          score = 0
        } else if (score > 4600) {
          score = 5000
        }
        setScore(score)
      }

    const preventScroll = (e) => {
        e.preventDefault()
        const delta = e.deltaY * -0.001;
        var newScale = pos.scale + delta;
        if (newScale >= 2.5) {
          newScale = pos.scale
        } else if (newScale <= 0.3) {
          newScale = pos.scale
        }
        const ratio = 1 - newScale / pos.scale;
  
        setPos({
          posX: pos.posX + (e.layerX - pos.posX - transform.posX) * ratio,
          posY: pos.posY + (e.layerY - pos.posY - transform.posY) * ratio,
          scale: newScale
        })
    }

    useEffect(() => {
      document.getElementById('image')?.addEventListener('wheel', preventScroll, {passive:false})
      return () => {
        document.getElementById('image')?.removeEventListener('wheel', preventScroll)
      }
    }, [load, pos.scale])

    useEffect(() => {
        const img = new Image()
        img.src = `${process.env.REACT_APP_API_URL}/mapSchema/${map.mapSchema}`
        img.onload = () => {
            setLoad(true)
            setImg({width: img.width, height: img.height})
        }
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

    return load && (
        <div id='cont' className={styles.container}>
            <div id ='imageCont' className={choseChecked ? styles.imgPickerChecked : styles.imgPicker}>
            <Draggable onDrag={(e, ui) => setTransform({posX:Math.round(transform.posX + ui.deltaX), posY: Math.round(transform.posY + ui.deltaY)})} handle='#image' defaultPosition={{x: -img.width / 2, y: -img.height / 2}}>
            <div>
                <div id='image' onDoubleClick={(e) => !choseChecked && setChoose(e)} className={styles.img} style={{backgroundImage: `url(${process.env.REACT_APP_API_URL}/mapSchema/${map.mapSchema})`, width: img.width, height: img.height, transform: `translate(${pos.posX}px, ${pos.posY}px) scale(${pos.scale})`, transition: 'all 0.3s ease'}}>
                <img loading='lazy' id='choose' src={map.phase === 1 ? clone1.src : clone2.src} className={styles.choose} />
                <canvas id='canv' width={img.width} height={img.height}></canvas>
                <img loading='lazy' id='trueChoose' src={`${process.env.REACT_APP_API_URL}/map/${map.image}`} className={styles.trueChoose} />
                </div>
            </div>
            </Draggable>
            </div>
            {!choseChecked && <MyButton disabled={!IsChosed || choseChecked} click={(e) => !choseChecked && checkChoose(e)} myStyle={{width: '100%', zIndex: 200}} variant={ButtonVariant.primary}>Выбрать</MyButton>}
        </div>
    )
}

export default PositionPickerFriends
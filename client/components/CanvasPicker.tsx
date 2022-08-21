import { useEffect } from 'react';

import React from 'react'

const CanvasPicker : React.FC = ()  => {
    useEffect(() => {
        const canvas = document.getElementById('canv') as HTMLCanvasElement
        const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D
        console.log(ctx)
        canvas.onclick = function (e : MouseEvent) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          var x : number = e.offsetX;
          var y : number = e.offsetY;
          ctx.beginPath()
          ctx.arc(x, y, 5, 0, 2*Math.PI, false)
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }, [])
  return (
    <>
      <canvas style={{background:'grey'}} id='canv' width='400px' height='400px'></canvas>
    </>
  )
}

export default CanvasPicker
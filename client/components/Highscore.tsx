import React from 'react'
import { useEffect } from 'react';
import { getHighscore } from '../api/mapAPI';

interface HighscoreProps {
    map: number
}

const Highscore : React.FC<HighscoreProps> = ({map}) => {
    useEffect(() => {
        getHighscore(map).then((res) => console.log(res))
    }, [])
    
  return (
    <div>
        
    </div>
  )
}

export default Highscore

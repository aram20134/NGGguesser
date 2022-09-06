import React, { useEffect, useState } from "react";
import styles from "../styles/MapChapter.module.scss";
import { useTypedSelector } from "./../hooks/useTypedSelector";
import Image from 'next/image';
import MyButton, { ButtonVariant } from "./UI/MyButton";
import MyButtonLink from "./UI/MyButtonLink";
import people from '../public/people.svg'
import avgScore from '../public/avgScore.svg'
import mapVariant from '../public/mapVariant.svg'
import Tooltip from "./UI/Tooltip";

interface MapChapterProps {
  title: string;
  phase: number;
}

const MapChapter: React.FC<MapChapterProps> = ({ title, phase}) => {
    let {maps} = useTypedSelector(st => st.map)
    maps = maps.filter((m) => m.phase === phase)
    return (
    <div className={styles.mapChapter}>
      <h2>{title}</h2>
      
      <hr />
      <div className={styles.cardContainer}>
        {maps.map((m) =>
        
          <div key={m.id} className={styles.cardMap}>
             <div className={styles.img}><Image src={`${process.env.REACT_APP_API_URL}/map/${m.image}`} width={'254px'} height={'254px'} objectFit='contain' className={styles.map} /></div>
             <div className={styles.title}>
                <h2>{m.name}</h2>
                <MyButtonLink myStyle={{marginTop:'2rem', fontSize: '18px'}} variant={ButtonVariant.outlined} link={`/map/${m.name.toLowerCase()}`}>Играть</MyButtonLink>                
            </div>
            <hr />
            <div className={styles.mapStats}>
                <Tooltip classN={styles.mapStatsItem + ' ' + (m.difficult === 'easy' ? styles.easy : styles.easy)} title="Ср. счёт">
                    <Image src={avgScore} width='25px' />
                    <p>{Math.round(m.userMapPlayeds.length != 0 ? m.userMapPlayeds.reduce((acc, cur, i, arr) => {return acc += cur.score}, 0) / m.userMapPlayeds.length : 0)}</p>
                </Tooltip>
                <Tooltip title="Сыграли" classN={styles.mapStatsItem}>
                    <Image src={people} width='25px' />
                    <p>{m.userMapPlayeds.length}</p>
                </Tooltip>
                <Tooltip title="Локаций" classN={styles.mapStatsItem}>
                    <Image src={mapVariant} width='25px' />
                    <p>{m.variantMaps.length}</p>
                </Tooltip>
            </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default MapChapter;
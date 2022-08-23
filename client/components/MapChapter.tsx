import React, { useEffect, useState } from "react";
import styles from "../styles/MapChapter.module.scss";
import { useTypedSelector } from "./../hooks/useTypedSelector";
import Image from 'next/image';
import MyButton, { ButtonVariant } from "./UI/MyButton";

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
             <div className={styles.img}><Image src={`${process.env.REACT_APP_API_URL}${m.image}`} width={'300px'} height={'300px'} /></div>
             <div className={styles.title}>
                <h2>{m.name}</h2>
                <MyButton myStyle={{marginTop:'2rem', fontSize: '18px'}} variant={ButtonVariant.outlined} click={() => console.log('click')}>Играть</MyButton>                
            </div>
            <hr />
            <div className={styles.mapStats}>
            </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default MapChapter;
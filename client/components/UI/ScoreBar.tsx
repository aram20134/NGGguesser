import { useEffect, useState } from "react";
import styles from "../../styles/ScoreBar.module.scss";

interface ScoreBarProps {
  title?: string;
  score: number;
  width: string;
  overlayLeft?: number | string;
  overlayRight?: number | string;
  myStyle?: object;
}
  
const ScoreBar: React.FC<ScoreBarProps> = ({ title, score, width, overlayRight, overlayLeft, myStyle }) => {
  const [scoreT, setScoreT] = useState(0)
  const [AnimOverlayLeft, setAnimOverlayLeft] = useState(0)

  useEffect(() => {
    let timeout = setTimeout(() => {
        setScoreT(score)
    }, 200);

    let count = 0
    let step = overlayLeft as number / 250

    let interval = setInterval(() => {
      count = count + 2
      setAnimOverlayLeft(count)

      if (count >= overlayLeft) {
        setAnimOverlayLeft(count - 2)
        clearInterval(interval)
      }
    }, step)

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, []);

  return (
    <div style={{ maxWidth: `${width}` }} className={styles.scoreBarContainer}>
      {title && <h1>{title}</h1>}
      <span style={{...myStyle}} className={styles.scoreBar}>
        <span style={{ maxWidth: `${scoreT}%`, position: 'absolute', width: "100%", ...myStyle }}></span>
        {overlayLeft && overlayRight && <div className={styles.overlay}>{AnimOverlayLeft + ' / ' + overlayRight}</div>}
      </span>
    </div>
  );
};

export default ScoreBar;

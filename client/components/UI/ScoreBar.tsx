import { useEffect, useState } from "react";
import styles from "../../styles/ScoreBar.module.scss";

interface ScoreBarProps {
  title?: string;
  score: number;
  width: string;
  overlay?: number;
  myStyle?: object;
}

const ScoreBar: React.FC<ScoreBarProps> = ({ title, score, width, overlay, myStyle }) => {
  const [scoreT, setScoreT] = useState(0)

  useEffect(() => {
    setTimeout(() => {
        setScoreT(score)
    }, 200);
  }, []);

  return (
    <div style={{ maxWidth: `${width}` }} className={styles.scoreBarContainer}>
      {title && <h1>{title}</h1>}
      <span style={{...myStyle}} className={styles.scoreBar}>
        <span style={{ maxWidth: `${scoreT}%`, position: 'absolute', width: "100%", ...myStyle }}></span>
        {overlay && <div className={styles.overlay}>{score + ' / ' + overlay}</div>}
      </span>
    </div>
  );
};

export default ScoreBar;

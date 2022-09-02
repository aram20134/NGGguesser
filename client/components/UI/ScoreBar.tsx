import { useEffect, useState } from "react";
import styles from "../../styles/ScoreBar.module.scss";

interface ScoreBarProps {
  title?: string;
  score: number;
  width: string;
}

const ScoreBar: React.FC<ScoreBarProps> = ({ title, score, width }) => {
    const [scoreT, setScoreT] = useState(0)
  useEffect(() => {
    setTimeout(() => {
        setScoreT(score)
    }, 200);
  }, []);

  return (
    <div style={{ maxWidth: `${width}` }} className={styles.scoreBarContainer}>
      <h1>{title}</h1>
      <span className={styles.scoreBar}>
        <span style={{ maxWidth: `${scoreT}%`, width: "100%" }}></span>
      </span>
    </div>
  );
};

export default ScoreBar;

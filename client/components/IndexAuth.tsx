import styles from '../styles/IndexAuth.module.scss'
import MapChapter from './MapChapter';

const IndexAuth : React.FC = () => {
  
  return (
    <main className={styles.indexAuth}>
        <div className={styles.bg}>
        </div>
        <div className={styles.container}>
          <h1>Выбери фазу и карту</h1>
          <MapChapter phase={1} title='PHASE 1'/>
          <MapChapter phase={2} title='PHASE 2' />
        </div>
    </main>
  )
}

export default IndexAuth
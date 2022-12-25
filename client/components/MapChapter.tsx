import { useEffect, useState } from "react";
import styles from "../styles/MapChapter.module.scss";
import { useTypedSelector } from "./../hooks/useTypedSelector";
import ImageNext from 'next/image';
import MyButton, { ButtonVariant } from "./UI/MyButton";
import MyButtonLink from "./UI/MyButtonLink";
import people from '../public/people.svg'
import avgScore from '../public/avgScore.svg'
import mapVariant from '../public/mapVariant.svg'
import Tooltip from "./UI/Tooltip";
import { Ilikes, Imap, IvariantMaps } from "../types/map";
import Draggable from "react-draggable";
import { changeVariantMap } from "../api/adminAPI";
import Alert, { AlertVariant } from "./UI/Alert";

interface MapChapterProps {
  title: string;
  phase: number;
  likes?: Ilikes[];
  adminMode?: boolean;
}

const MapChapter: React.FC<MapChapterProps> = ({title, phase, likes, adminMode}) => {
    const [loaded, setLoaded] = useState(false)
    var {maps} = useTypedSelector(st => st.map)
    const [filteredMaps, setFilteredMaps] = useState<Imap[]>([])
    const [adminModeActive, setAdminModeActive] = useState<Imap>()
    const [variantActive, setVariantActive] = useState<IvariantMaps>()
    const [scale, setScale] = useState<number>(1)
    const [pos, setPos] = useState<{posX: number, posY: number}>({posX: 0, posY: 0})
    const [fetching, setFetching] = useState({state: false, message: ''})

    useEffect(() => {
        if (!likes) {
          setFilteredMaps(maps.filter((m) => m.phase === phase))
        } else {
          setFilteredMaps(maps.filter((m) => {
            if (likes.find((l) => l.mapId === m.id && m.phase === phase)) {
              return m
            }
          }))
        }
        if (filteredMaps) {
          setLoaded(true)
        }
    }, [maps])

    const preventScroll = (e) => {
      console.log('wh');
      if (e.deltaY < 0 && scale <= 2.5) {
        setScale(prev => prev + 0.05)
      } else if (e.deltaY > 0 && scale >= 0.3) {
        setScale(prev => prev - 0.05)
      }
      e.preventDefault()
      return false
    }

    useEffect(() => {
      if (adminModeActive) {
        const schemaImg = new Image()
        const schema = document.getElementById('schema')
        schemaImg.src = `${process.env.REACT_APP_API_URL}/mapSchema/${adminModeActive.mapSchema}`
        schemaImg.onload = () => {
          schema.style.height = `${schemaImg.height}px`
          schema.style.width = `${schemaImg.width}px`
          schema.style.backgroundImage = `url(${schemaImg.src})`
        }
        const scaleWrapper = document.getElementById('scale')
        scaleWrapper.addEventListener('wheel', preventScroll, {passive: false})
        return () => {
          scaleWrapper.removeEventListener('wheel', preventScroll)
        }
      }
    }, [adminModeActive, scale])

    useEffect(() => {
      if (variantActive) {
        setFetching({state: false, message: ''})
        const mapImage = document.getElementById('variant')
        mapImage.className = styles.chose

        var posX = Math.round(variantActive.posX / 9 + variantActive.mapId * 2) - 20
        var posY = Math.round(variantActive.posY / 9 + variantActive.mapId * 2) - 20
        setPos({posX, posY})
        mapImage.style.transform = `translate(${posX}px, ${posY}px)`
        mapImage.style.visibility = 'visible'
        mapImage.style.transition = 'all 0.3s ease'

        // const schema = document.getElementById('schema')
        // schema.appendChild(mapImage)
      }
    }, [variantActive])

    useEffect(() => {
      console.log(variantActive);
    }, [variantActive])

    const handleDrag = (e, ui) => {
      e.target.style.transition = 'none'
      
      setPos({posX:Math.round(pos.posX + ui.deltaX), posY: Math.round(pos.posY + ui.deltaY)})
    }

    const saveChanges = () => {
      if (variantActive) {
        setFetching({state: true, message: ''})
        changeVariantMap({id: variantActive.id, posX: pos.posX, posY: pos.posY, mapId: variantActive.mapId}).then((e) => setFetching({state: false, message: e.message}))
      }
    }
    
    if (!loaded) {
      return (
        <div className={styles.mapChapter} style={{height:'300px'}}>
          <h2>{title}</h2>
          <hr />
          <div className={styles.cardContainer}>
            <div className="loader"></div>
          </div>
        </div>
      )
    }
    
    return !adminMode ? (
      <div className={styles.mapChapter}>
        <h2>{title}</h2>
        <hr />
        <div className={styles.cardContainer}>
          {filteredMaps.map((m) =>
            <div key={m.id} className={styles.cardMap}>
              <div className={styles.img}><ImageNext src={`${process.env.REACT_APP_API_URL}/map/${m.image}`} width={'254px'} height={'254px'} objectFit='contain' className={styles.map} /></div>
              <div className={styles.title}>
                  <h2>{m.name}</h2>
                  <MyButtonLink myStyle={{marginTop:'2rem', fontSize: '18px'}} variant={ButtonVariant.outlined} link={`/map/${m.name.toLowerCase()}`}>Играть</MyButtonLink>                
              </div>
              <hr />
              <div className={styles.mapStats}>
                  <Tooltip classN={styles.mapStatsItem + ' ' + (m.difficult === 'easy' ? styles.easy : styles.easy)} title="Ср. счёт">
                      <ImageNext src={avgScore} width='25px' />
                      <p>{Math.round(m.userMapPlayeds.length != 0 ? m.userMapPlayeds.reduce((acc, cur, i, arr) => {return acc += cur.score}, 0) / m.userMapPlayeds.length : 0)}</p>
                  </Tooltip>
                  <Tooltip title="Сыграли" classN={styles.mapStatsItem}>
                      <ImageNext src={people} width='25px' />
                      <p>{m.userMapPlayeds.length}</p>
                  </Tooltip>
                  <Tooltip title="Локаций" classN={styles.mapStatsItem}>
                      <ImageNext src={mapVariant} width='25px' />
                      <p>{m.variantMaps.length}</p>
                  </Tooltip>
              </div>
            </div>
          )}
        </div>
      </div>
  ) : (
    <div className={styles.mapChapter}>
        <h2>{title}</h2>
        <hr />
        <div className={styles.cardContainer}>
          {filteredMaps.filter((m) => adminModeActive?.id === undefined || adminModeActive.id === m.id).map((m) => 
            {return adminModeActive ? (
              <>
                <div key={m.image} className={styles.cardMap}>
                <div className={styles.img}><ImageNext src={`${process.env.REACT_APP_API_URL}/map/${m.image}`} width={'254px'} height={'254px'} objectFit='contain' className={styles.map} /></div>
                  <div className={styles.title}>
                    <h2>{m.name}</h2>
                    <MyButton click={() => setAdminModeActive(m)} myStyle={{marginTop:'2rem', fontSize: '18px'}} variant={ButtonVariant.outlined}>Изменить</MyButton>                
                  </div>
                  <hr />
                  <div className={styles.mapStats}>
                    <Tooltip classN={styles.mapStatsItem + ' ' + (m.difficult === 'easy' ? styles.easy : styles.easy)} title="Ср. счёт">
                        <ImageNext src={avgScore} width='25px' />
                        <p>{Math.round(m.userMapPlayeds.length != 0 ? m.userMapPlayeds.reduce((acc, cur, i, arr) => {return acc += cur.score}, 0) / m.userMapPlayeds.length : 0)}</p>
                    </Tooltip>
                    <Tooltip title="Сыграли" classN={styles.mapStatsItem}>
                        <ImageNext src={people} width='25px' />
                        <p>{m.userMapPlayeds.length}</p>
                    </Tooltip>
                    <Tooltip title="Локаций" classN={styles.mapStatsItem}>
                        <ImageNext src={mapVariant} width='25px' />
                        <p>{m.variantMaps.length}</p>
                    </Tooltip>
                  </div>
                </div>
                {!fetching.state ? (
                <div className={styles.navContainer}>
                  <button onClick={() => {setAdminModeActive(null), setFetching({state: false, message: ''}), setVariantActive(null)}}>Назад</button>
                  <button onClick={saveChanges} style={{background: 'darkred'}}>Сохранить</button>
                  {fetching.message && <Alert title="Сохранено" variant={AlertVariant.success}>Все изменения успешно сохранены</Alert>}
                </div> )
                : (
                  <div className="loader"></div>
                )}
                <div className={styles.adminCardInfo}>
                  <p><b>Карта:</b> {m.name}</p>
                  <p><b>Описание:</b> {m.description}</p>
                  <p >
                    <b>Схема карты:</b>
                    {/* придумай здесь изменение картинки в зависимости от изменения рамзеров картинки ниже, она в 2 раза меньше примерно */}
                    <div style={{overflow:'hidden', maxHeight: '700px', userSelect:'none'}}>
                      <Draggable handle='#schema'>
                       <div>
                        <div id='scale' style={{transform: `scale(${scale})`, transition: 'all 0.3s ease'}}>
                        <div id="schema"></div>
                        <Draggable scale={scale} position={{x: pos.posX, y: pos.posY}} onDrag={handleDrag}>
                          <img draggable='false' id='variant' src={`${process.env.REACT_APP_API_URL}/map/${m.image}`} className={styles.chose} />
                        </Draggable>
                        </div>
                       </div>
                      </Draggable>
                    </div>
                  </p>
                  <p>
                    <b onClick={() => console.log('a')} style={{display:'block', margin:'5px'}}>Варианты:</b>
                    <div className={styles.mapVariantsContainer}>
                    {m.variantMaps.map((v) => 
                      <div onClick={() => setVariantActive({...v, mapImage: m.image})} className={styles.mapVariant} key={v.image}>
                        <table>
                          <tbody>
                            <tr><td>id: </td><td>{v.id}</td></tr>
                            <tr><td>mapId: </td><td>{v.mapId}</td></tr>
                            <tr><td>posX: </td><td>{variantActive?.id === v.id ? pos.posX : Math.round(v.posX / 9 + v.mapId * 2) - 20}</td></tr>
                            <tr><td>posY: </td><td>{variantActive?.id === v.id ? pos.posY : Math.round(v.posY / 9 + v.mapId * 2) - 20}</td></tr>
                          </tbody>
                        </table>
                        <div style={{position:'relative', width:'100%', minHeight: '200px'}}><ImageNext style={{borderRadius:'15px'}} src={`${process.env.REACT_APP_API_URL}/variantMaps/${v.image}`} layout="fill" /></div>
                      </div>
                    )}
                    </div>
                  </p>
                </div>
              </>
            ) : (
              <div key={m.image} className={styles.cardMap}>
                <div className={styles.img}><ImageNext src={`${process.env.REACT_APP_API_URL}/map/${m.image}`} width={'254px'} height={'254px'} objectFit='contain' className={styles.map} /></div>
                <div className={styles.title}>
                  <h2>{m.name}</h2>
                  <MyButton click={() => setAdminModeActive(m)} myStyle={{marginTop:'2rem', fontSize: '18px'}} variant={ButtonVariant.outlined}>Изменить</MyButton>                
                </div>
                <hr />
                <div className={styles.mapStats}>
                  <Tooltip classN={styles.mapStatsItem + ' ' + (m.difficult === 'easy' ? styles.easy : styles.easy)} title="Ср. счёт">
                      <ImageNext src={avgScore} width='25px' />
                      <p>{Math.round(m.userMapPlayeds.length != 0 ? m.userMapPlayeds.reduce((acc, cur, i, arr) => {return acc += cur.score}, 0) / m.userMapPlayeds.length : 0)}</p>
                  </Tooltip>
                  <Tooltip title="Сыграли" classN={styles.mapStatsItem}>
                      <ImageNext src={people} width='25px' />
                      <p>{m.userMapPlayeds.length}</p>
                  </Tooltip>
                  <Tooltip title="Локаций" classN={styles.mapStatsItem}>
                      <ImageNext src={mapVariant} width='25px' />
                      <p>{m.variantMaps.length}</p>
                  </Tooltip>
                </div>
            </div>
            )
            }
          )}
        </div>
      </div>
  )
};

export default MapChapter;
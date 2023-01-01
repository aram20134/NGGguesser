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
import { addVariantMap, changeMap, changeVariantMap, deleteVariantMap } from "../api/adminAPI";
import { AlertVariant } from "./UI/Alert";
import save from '../public/save.svg'
import MyInput from "./UI/MyInput";
import dynamic from "next/dynamic";

const DynamicModal = dynamic(() => import('../components/UI/Modal'))
const ScoreBar = dynamic(() => import('../components/UI/ScoreBar'))
const Alert = dynamic(() => import('./UI/Alert'))

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
    const [pos, setPos] = useState<{posX: number, posY: number}>({posX: 0, posY: 0})
    const [posSchema, setPosSchema] = useState<{posX: number, posY: number, scale: number}>({posX: 0, posY: 0, scale: 1})
    const [transform, setTransform] = useState<{posX: number, posY: number}>({posX: 0, posY: 0})
    const [fetching, setFetching] = useState({state: false, message: ''})
    const [modalIsActive, setModalIsActive] = useState(false)
    const [valueInput, setValueInput] = useState<any>()
    const [loading, setLoading] = useState()

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
      e.preventDefault()
      const delta = e.deltaY * -0.001;
      var newScale = posSchema.scale + delta;
      if (newScale >= 2.5) {
        newScale = posSchema.scale
      } else if (newScale <= 0.3) {
        newScale = posSchema.scale
      }
      const ratio = 1 - newScale / posSchema.scale;

      setPosSchema({
        posX: posSchema.posX + (e.layerX - posSchema.posX - transform.posX) * ratio,
        posY: posSchema.posY + (e.layerY - posSchema.posY - transform.posY) * ratio,
        scale: newScale
      })
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
    }, [adminModeActive, posSchema.scale])

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
      if (valueInput) {
        const reader = new FileReader()
        valueInput.target.files[0] !== undefined && reader.readAsDataURL(valueInput.target.files[0])
        reader.onload = async (e : any) => {
          e.target.result.split('/')[0] === "data:image" && e.target.result 
          const {Viewer} = await import('photo-sphere-viewer')
          const panorama = new Viewer({
            container: document.querySelector('#viewer') as any,
            // panorama: e.target.result,
            fisheye: false,
            defaultZoomLvl: 0,
            navbar: [],
            loadingImg: ``,
            panoData: (img) => ({
              fullWidth: img.width,
              fullHeight: Math.round(img.width / 2),
              croppedWidth: img.width,
              croppedHeight: img.height,
              croppedX: 0,
              croppedY: Math.round((img.width / 2 - img.height) / 2),
            })
          });
            panorama.setPanorama(e.target.result)
            document.querySelector('#viewer').children.length == 2 && document.querySelector('#viewer > .psv-container').remove()
            
            return () => {
              panorama.destroy()
            }
        }
      }
    }, [valueInput])

    const handleDrag = (e, ui) => {
      e.target.style.transition = 'none'
      setPos({posX:Math.round(pos.posX + ui.deltaX), posY: Math.round(pos.posY + ui.deltaY)})
    }

    const handleDragSchema = (e, ui) => {
      setTransform({posX:Math.round(transform.posX + ui.deltaX), posY: Math.round(transform.posY + ui.deltaY)})
    }
    const deleteVariant = (variant) => {
      deleteVariantMap({id: variant.id})
      setFilteredMaps(filteredMaps.filter((m, i) => {
        if (m.id === adminModeActive.id) {
          filteredMaps[i].variantMaps = filteredMaps[i].variantMaps.filter((v) => v.id !== variant.id)
        }
        return m
      }))
    }

    const handleActive = (map) => {
      setFilteredMaps(filteredMaps.map((m) => {
        if (m.id === map.id) {
          m.active = !m.active
        }
        return m
      }))
      changeMap({id: map.id, active: map.active})
    }

    const handleActiveVariant = (e, v) => {
      v.active = !v.active
      changeVariantMap({id: variantActive.id, posX: Math.round(v.posX / 9 + v.mapId * 2) - 20, posY: Math.round(v.posY / 9 + v.mapId * 2) - 20, mapId: variantActive.mapId, active: v.active})
    }

    const addVariant = () => {
      console.log('first')
      const reader = new FileReader()
      valueInput.target.files[0] !== undefined && reader.readAsDataURL(valueInput.target.files[0])
      reader.onload = async (e : any) => {
        const variant = new FormData()
        variant.append('img', valueInput.target.files[0])
        variant.append('mapId', adminModeActive.id.toString())
        addVariantMap(variant, setLoading).then(variantMap => setFilteredMaps(filteredMaps.filter((m) => {
          if (m.id === variantMap.mapId) {
            m.variantMaps.push(variantMap)
          }
          return m
        })))
      }
      
    }

    const saveChanges = (map) => {
      if (variantActive) {
        setFilteredMaps(filteredMaps.map((m) => {
          if (m.id === map.id) {
            m.variantMaps.find(i => {
              if (i.id === variantActive.id) {
                variantActive.posX = pos.posX
                variantActive.posY = pos.posY
                i.posX = Math.round(pos.posX * 9 - variantActive.mapId * 2) - 40
                i.posY = Math.round(pos.posY * 9 - variantActive.mapId * 2) - 40
              } 
            })
          }
          return m
        }))
        setFetching({state: true, message: ''})
        changeVariantMap({id: variantActive.id, posX: pos.posX, posY: pos.posY, mapId: variantActive.mapId, active: variantActive.active}).then((e) => setFetching({state: false, message: e.message}))
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
          {filteredMaps.map((m) => m.active &&
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
                      <p>{m.variantMaps.reduce((acc, cur) => {return cur.active ? acc + 1 : acc}, 0)}</p>
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
        <div className={styles.cardContainer} style={{justifyContent: adminModeActive && 'center'}}>
          {filteredMaps.filter((m) => adminModeActive?.id === undefined || adminModeActive.id === m.id).map((m) => 
            {return adminModeActive ? (
              <>
                <div key={m.image} className={styles.cardMap}>
                <DynamicModal onSubmit={{name: 'Добавить', action: () => addVariant()}} onClose={{name: 'Закрыть', action: () => {setModalIsActive(false), setLoading(null)}}} title={`Добавление варианта карты ${adminModeActive.name}`} modalActive={modalIsActive}>
                  <div className={styles.modalVariant}>
                    <MyInput title="Панорама" type="file" setValue={setValueInput} description='Убедитесь, что панорама отображается правильно.' />
                    <div id="viewer" style={{height:'600px', minWidth:'100%', width:'1200px', overflow:'hidden'}}></div>
                    {loading &&
                      <ScoreBar title="Загружаем..." score={loading} width={'1000'} overlayLeft={loading} overlayRight={'100'} />
                    }
                  </div>
                </DynamicModal>
                <div className={styles.img}><ImageNext src={`${process.env.REACT_APP_API_URL}/map/${m.image}`} width={'254px'} height={'254px'} objectFit='contain' className={styles.map} /></div>
                  <div className={styles.title}>
                    <h2>{m.name}</h2>
                    <MyButton myStyle={{fontSize: '18px', marginTop:'2rem'}} variant={ButtonVariant.outlined} click={() => setModalIsActive(true)}>Добавить вариант</MyButton>
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
                        <p>{m.variantMaps.reduce((acc, cur) => {return cur.active ? acc + 1 : acc}, 0)}</p>
                    </Tooltip>
                  </div>
                </div>
                {!fetching.state ? (
                <div className={styles.navContainer}>
                  <button onClick={() => {setAdminModeActive(null), setFetching({state: false, message: ''}), setVariantActive(null)}}>Назад</button>
                  <button onClick={() => saveChanges(m)} style={{background: 'darkred', opacity: variantActive ? '1' : '0.5', cursor: variantActive ? 'pointer' : 'not-allowed'}}>
                    <ImageNext src={save} />
                    Сохранить
                  </button>
                </div> )
                : (
                  <div className="loader"></div>
                )}
                {fetching.message && <Alert title={`Сохранено`} variant={AlertVariant.success}>Все изменения успешно сохранены</Alert>}
                {variantActive && !fetching.message && <Alert title={`Внимание!`} variant={AlertVariant.warning}>При нажатии кнопки &quot;Сохранить&quot;, сохраняется только последняя изменённая карта! <br /> При редактировании нескольких карт изменяйте их поочередно.</Alert>}
                <div className={styles.adminCardInfo}>
                  <p style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <b>Статус: </b> 
                    <label className="switch">
                      <input onChange={() => handleActive(m)} checked={m.active} type="checkbox" />
                      <span className="slider round"></span>
                    </label>
                  </p>
                  <p><b>Карта:</b> {m.name}</p>
                  <p><b>Описание:</b> {m.description}</p>
                  <p >
                    <b>Схема карты:</b>
                    {/* придумай здесь изменение картинки в зависимости от изменения рамзеров картинки ниже, она в 2 раза меньше примерно */}
                    <div style={{overflow:'hidden', maxHeight: '700px', userSelect:'none'}}>
                      <Draggable handle='#schema' onDrag={handleDragSchema}>
                       <div>
                        <div id='scale' style={{transform: `translate(${posSchema.posX}px, ${posSchema.posY}px) scale(${posSchema.scale})`, transition: 'all 0.3s ease', transformOrigin: '0px 0px'}}>
                        <div id="schema"></div>
                        <Draggable scale={posSchema.scale} position={{x: pos.posX, y: pos.posY}} onDrag={handleDrag}>
                          <img draggable='false' id='variant' src={`${process.env.REACT_APP_API_URL}/map/${m.image}`} className={styles.chose} />
                        </Draggable>
                        </div>
                       </div>
                      </Draggable>
                    </div>
                  </p>
                  <p>
                    <b onClick={() => console.log(variantActive)} style={{display:'block', margin:'5px'}}>Варианты:</b>
                    <div className={styles.mapVariantsContainer}>
                    {m.variantMaps.map((v) => 
                      <div onClick={() => setVariantActive({...v, mapImage: m.image})} className={styles.mapVariant} key={v.image}>
                        <table>
                          <tbody>
                            <tr><td>id: </td><td>{v.id}</td></tr>
                            <tr><td>mapId: </td><td>{v.mapId}</td></tr>
                            <tr><td>posX: </td><td>{variantActive?.id === v.id ? pos.posX : Math.round(v.posX / 9 + v.mapId * 2) - 20}</td></tr>
                            <tr><td>posY: </td><td>{variantActive?.id === v.id ? pos.posY : Math.round(v.posY / 9 + v.mapId * 2) - 20}</td></tr>
                            <tr>
                              <td>Статус: </td>
                              <td>
                                <label className="switch">
                                  <input onChange={(e) => handleActiveVariant(e, v)} checked={v.active} type="checkbox" />
                                  <span className="slider round"></span>
                                </label>
                              </td>
                            </tr>
                            <tr><MyButton myStyle={{fontSize: '16px'}} variant={ButtonVariant.outlined} click={() => deleteVariant(v)}>Удалить</MyButton></tr>
                          </tbody>
                        </table>
                        <div style={{position:'relative', width:'100%', minHeight: '200px'}}><ImageNext style={{borderRadius:'15px'}} placeholder="blur" blurDataURL={`${process.env.REACT_APP_API_URL}/variantMaps/${v.image}`} src={`${process.env.REACT_APP_API_URL}/variantMaps/${v.image}`} layout="fill" /></div>
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
                      <p>{m.variantMaps.reduce((acc, cur) => {return cur.active ? acc + 1 : acc}, 0)}</p>
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
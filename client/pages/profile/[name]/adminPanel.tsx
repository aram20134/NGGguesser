import { GetServerSideProps } from "next";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { getAllUsers } from "../../../api/userAPI";
import MainContainer from "../../../components/MainContainer";
import { NextThunkDispatch, wrapper } from "../../../store";
import { setUserProps } from "../../../store/actions/user";
import styles from "../../../styles/AdminPanel.module.scss";
import { userState } from "./../../../types/user";
import UserCard from './../../../components/UserCard';
import MapChapter from "../../../components/MapChapter";
import { setMaps } from "../../../store/actions/map";
import Image from "next/image";
import mapSVG from '../../../public/mapVariant.svg'
import people from '../../../public/people.svg'

interface AdminPanelProps {
  user: userState;
  users: userState[];
}

const AdminPanel: NextPage<AdminPanelProps> = ({ user, users }) => {
  const buttons = [{name: 'maps', ru: 'Карты'}, {name: 'users', ru: 'Пользователи'}]
  const buttonsMaps = [{name: 'showMaps', ru:'Все карты'}, {name: 'addMap', ru: 'Добавить карту'}]
  const [buttonActive, setButtonActive] = useState(buttons[0]);
  const [buttonMaps, setButtonMaps] = useState(buttonsMaps[0])
  const [sortType, setSortType] = useState(null)
  const [allUsers, setAllUsers] = useState(users)
  
  const [search, setSearch] = useState("")

  const test = (e : React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('a')
  }

  useEffect(() => {
    switch (sortType) {
      case "name":
        setAllUsers(users.filter((u) => u.name.includes(search.toLocaleLowerCase())).sort((a, b) => a.name.localeCompare(b.name)))
        break;
      case "lvl":
        setAllUsers(users.filter((u) => u.name.includes(search.toLocaleLowerCase())).sort((a, b) => a.level - b.level).reverse())
        break;
      case "admin":
        setAllUsers(users.filter((u) => u.name.includes(search.toLocaleLowerCase())).sort((a, b) => a.role.localeCompare(b.role)))
        break;
      default:
        setAllUsers(users.filter((u) => u.name.includes(search.toLocaleLowerCase())))
        break;
    }
  }, [search, sortType])

  return allUsers && (
    <MainContainer title="Админ панель">
      <main className={styles.adminPanel}>
        
        <div className={styles.bg}></div>
        <div className={styles.container}>
          <div className={styles.buttonType}>
              <button onClick={() => setButtonActive(buttons[0])} className={buttonActive.name === 'maps' && styles.active}>
                <Image src={mapSVG} />
                Карты
              </button>
              <button onClick={() => setButtonActive(buttons[1])} className={buttonActive.name === 'users' && styles.active}>
                <Image src={people} />
                <p>Пользователи</p>
              </button>
          </div>
          <div className={styles.buttonInfo}>
            <h1>{buttonActive.ru}</h1>
            {buttonActive.name === 'maps' &&
              <>
              <div className={styles.buttonSection}>
                <button onClick={() => setButtonMaps(buttonsMaps[0])} className={buttonMaps.name === 'showMaps' && styles.active}>Все карты</button>
                <button onClick={() => setButtonMaps(buttonsMaps[1])} className={buttonMaps.name === 'addMap' && styles.active}>Добавить карту</button>
              </div>
              <div>
                <MapChapter phase={1} title='PHASE 1' adminMode />
                <MapChapter phase={2} title='PHASE 2' adminMode />
              </div>
              </>
            }
            {buttonActive.name === 'users' &&
              <div className={styles.usersContainer}>
                <p>Найдено: {allUsers.length}</p>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по нику" type='text' className={styles.inputSearch} />
                <div className={styles.sortContainer}>
                  <p>Сортировать по:</p>
                  <div className={styles.sortInput}>
                    <input onChange={() => setSortType('name')} type="radio" id='name' name='sort' />
                    <label htmlFor="name">Нику</label>
                    <input onChange={() => setSortType('lvl')} type="radio" id='lvl' name='sort' />
                    <label htmlFor="lvl">Уровню</label>
                    <input onChange={() => setSortType('admin')} type="radio" id='admin' name='sort' />
                    <label htmlFor="admin">Админам</label>
                  </div>
                </div>
                {allUsers.map((u) => (
                    <UserCard user={u} key={u.id} />
                ))}
                {allUsers.length === 0 && <h3 style={{alignSelf: 'center'}}>Пользователь не найден</h3>}
              </div>
            }
          </div>
        </div>
      </main>
    </MainContainer>
  );
};

export default AdminPanel;

export const getServerSideProps: GetServerSideProps =
  wrapper.getServerSideProps((store) => async ({ req, res, query }) => {
    const dispatch = store.dispatch as NextThunkDispatch;

    await dispatch(setUserProps(req.cookies.token));
    await dispatch(setMaps())
    const { user } = store.getState();
    var param = query.name;
    const {users} = await getAllUsers()

    if (param !== user.name && user.role !== "ADMIN") {
      return {
        notFound: true,
      };
    }

    return {
      props: { user, users },
    };
  });

import { GetServerSideProps, NextPage } from "next";
import React, { useEffect, useState } from "react";
import { log } from "../api/userAPI";
import Alert, { AlertVariant } from "../components/UI/Alert";
import MyButton, { ButtonVariant } from "../components/UI/MyButton";
import { useActions } from "../hooks/useActions";
import styles from "../styles/SignIn.module.scss";
import { userState } from "../types/user";
import MainContainer from "./../components/MainContainer";
import MyInput from "./../components/UI/MyInput";
import { useTypedSelector } from './../hooks/useTypedSelector';
import { useRouter } from 'next/router';
import { io } from "socket.io-client";
import { NextThunkDispatch, wrapper } from "../store";
import { getCookie } from "cookies-next";
import { useSocket } from './../hooks/useSocket';

const Signin: NextPage = () => {
  const [nameL, setNameL] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false);

  const {setUser} = useActions()
  const sockets = useTypedSelector(state => state.socket)
  const router = useRouter() 
  const socket = useSocket()

  const checkLogin = async (e : React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 

    if (nameL.length <= 3 || password.length <= 3) {
      setError("enter");
      setLoading(false);
      return;
    }
    
    log(nameL, password)
    .then((res : userState) => {
      return (
        setUser(res),
        setTimeout(() => {
          router.push('/')
        }, 1000)
      )
    })
    .finally(()=> {
      return setError('success'), setLoading(false)
    })
    .catch((e) => setError('noUser'))
  }

  useEffect(() => {
    setError("");
  }, [nameL, password]);

  return (
    <MainContainer title="Вход">
      <main className={styles.main}>
        <div className={styles.background}></div>
        <h1>Вход</h1>
        <form onSubmit={(e) => checkLogin(e)}>
          <div className={styles.form}>
            <MyInput value={nameL} setValue={setNameL} type="text" title="Никнейм" />
            <MyInput value={password} setValue={setPassword} type="password" title="Пароль" />
          </div>
          <div className={styles.signup}>
            <MyButton loading={loading} click={(e) => checkLogin(e)} variant={ButtonVariant.primary}>
              Войти
            </MyButton>
          </div>
        </form>
        {error === "enter" && (
          <Alert title="Ошибка входа" variant={AlertVariant.danger}>
            Никнейм или пароль короче 4 символов!
          </Alert>
        )}
        {error === "noUser" && (
          <Alert title="Ошибка входа" variant={AlertVariant.danger}>
            Пользователь не найден
          </Alert>
        )}
        {error === "success" && (
          <Alert title="Успешный вход" variant={AlertVariant.success}>
            Вы успешно вошли
          </Alert>
        )}
      </main>
    </MainContainer>
  );
};

export default Signin;

export const getServerSideProps : GetServerSideProps = wrapper.getServerSideProps(store => async ({req, res, query}) => {
  if (req.cookies.token) {
    return {
      props: {},  
      redirect: {destination: '/', permanent: true}
    }
  }
  return {
    props: {}
  }
})
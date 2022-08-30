import { GetServerSideProps, NextPage } from "next";
import React, { useEffect, useState } from "react";
import MyButton, { ButtonVariant } from "../components/UI/MyButton";
import MyInput from "../components/UI/MyInput";
import styles from "../styles/SignUp.module.scss";
import MainContainer from "./../components/MainContainer";
import { checkUser, reg, users } from "../api/userAPI";
import Alert, { AlertVariant } from "../components/UI/Alert";
import Link from "next/link";
import {useRouter} from "next/router";
import { useTypedSelector } from './../hooks/useTypedSelector';
import { NextThunkDispatch, wrapper } from './../store/index';
import { setUser } from './../store/actions/user';
import { userState } from './../types/user';

const signup = () => {
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setError("");
  }, [name, password, password2]);

  const checkRegistration = async (e : React.FormEvent) => {
    e.preventDefault()
    setLoading(true);
    if (name.length <= 3 || name.length >= 16) {
      setError("name");
      setLoading(false);
      return;
    }

    if (password !== password2 || (password.length <= 3 && password2.length <= 3) ||  (password.length >= 16 && password2.length >= 16)) {
      setError("password");
      setLoading(false);
      return;
    }
    reg(name, password)
    .then(() => {return setError('success'), setLoading(false)})
    .catch((e) => {
        if (e.response?.status === 404) {
            setError('404'), setLoading(false)
        } else {
            setError('505'), setLoading(false)
        }
    })
    setName('')
    setPassword('')
    setPassword2('')
  };
  return (
    <MainContainer title="Регистрация">
      <main className={styles.main}>
        <div className={styles.background}></div>
        <h1>Создайте аккаунт</h1>
        <form onSubmit={(e) => checkRegistration(e)}>
          <div className={styles.form}>
            <MyInput
              value={name}
              setValue={setName}
              type="text"
              title="Никнейм"
              description="Никнейм должен содержать не менее 4 символов"
            />
            <MyInput
              value={password}
              setValue={setPassword}
              type="password"
              title="Пароль"
              description="Пароль должен содержать не менее 4 символов"
            />
            <MyInput
              value={password2}
              setValue={setPassword2}
              type="password"
              title="Повторите пароль"
            />
            <input type='submit' hidden />
            <div className={styles.signup}>
                <MyButton
                loading={loading}
                click={(e) => checkRegistration(e)}
                variant={ButtonVariant.primary}
                >
                Создать
                </MyButton>
            </div>
          </div>
        </form>
        {error === "password" && (
          <Alert title="Ошибка регистрации" variant={AlertVariant.danger}>
            Возможные причины:<br />
            1. Не указан Пароль<br />
            2. Длина Пароля меньше 4 символов<br />
            3. Длина Пароля более 15 символов<br />
            4. Пароли не совпадают
          </Alert>
        )}
        {error === "name" && (
          <Alert title="Ошибка регистрации" variant={AlertVariant.danger}>
            Возможные причины:<br />
            1. Не указан Никнейм<br />
            2. Длина Никнейма меньше 4 символов<br />
            3. Длина Никнейма более 15 символов
          </Alert>
        )}
        {error === "404" && (
          <Alert title="Ошибка регистрации" variant={AlertVariant.danger}>
            Игрок с таким Никнеймом уже существует!
          </Alert>
        )}
        {error === "505" && (
          <Alert title="Неизвестная ошибка" variant={AlertVariant.danger}>
            Ошибка со стороны сервера
          </Alert>
        )}
        {error === "success" && (
          <Alert title="Успешно!" variant={AlertVariant.success}>
            Вы успешно зарегистрировалсь! Теперь можете перейти на страницу{" "}
            <Link href="/signin">
              <span style={{ textDecoration: "underline", cursor: "pointer" }}>
                входа
              </span>
            </Link>
          </Alert>
        )}
      </main>
    </MainContainer>
  );
};

export default signup;

export async function getServerSideProps({req}) {
  if (req.cookies.token) {
    return {
      props: {},  
      redirect: {destination: '/', permanent: true}
    }
  }
  return {
    props: {}
  }
}
import Link from 'next/link';
import React, { CSSProperties } from 'react'
import styles from '../../styles/MyButton.module.scss'

export enum ButtonVariant {
    outlined = 'outlined',
    primary = 'primary'
}

interface MyButtonProps {
    children: React.ReactNode;
    variant: ButtonVariant;
    click: Function;
    loading?: boolean;
    myStyle?: object;
}

const MyButton : React.FC<MyButtonProps> = ({children, variant, click, loading = false, myStyle}) => {
  if (loading) {
    return ButtonVariant.outlined == variant ? (
      <button style={{...myStyle}} onClick={(e) => click(e)} className={styles.outlined + ' ' + styles.disabled}><div className={styles.loader}></div>{children}</button>
    ) : (
      <button style={{...myStyle}} onClick={(e) => click(e)} className={styles.primary + ' ' + styles.disabled}><div className={styles.loader}></div>{children}</button>
    )
  } else {
    return ButtonVariant.outlined == variant ? (
      <button style={{...myStyle}} onClick={(e) => click(e)} className={styles.outlined}>{children}</button>
    ) : (
      <button style={{...myStyle}} onClick={(e) => click(e)} className={styles.primary}>{children}</button>
    )
  }
}

export default MyButton
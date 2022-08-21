import React from 'react'
import styles from '../../styles/Alert.module.scss'
import danger from '../../public/danger.png'
import warning from '../../public/warning.png'
import check from '../../public/check.png'

export enum AlertVariant {
    danger = 'danger',
    warning = 'warning',
    success = 'success',
}

interface AlertProps {
    children: React.ReactNode;
    variant: AlertVariant;
    title: string;
}

const Alert : React.FC<AlertProps> = ({children, variant, title}) => {
  if (variant === AlertVariant.danger) {
    return (
        <div className={styles.danger}>
            <img src={danger.src} />
            <h2>{title}</h2>
            <p>{children}</p>
        </div>
      )
  } else if (variant === AlertVariant.warning) {
    return (
        <div className={styles.warning}>
            <img src={warning.src} />
            <h2>{title}</h2>
            <p>{children}</p>
        </div>
      )
  } else {
    return (
        <div className={styles.success}>
            <img src={check.src} />
            <h2>{title}</h2>
            <p>{children}</p>
        </div>
      )
  }
}

export default Alert
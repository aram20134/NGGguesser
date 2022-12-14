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
    disabled?: boolean;
}

const MyButton : React.FC<MyButtonProps> = ({children, variant, click, loading = false, myStyle, disabled = false}) => {
  if (loading && !disabled) {
    return ButtonVariant.outlined == variant ? (
      <button style={{...myStyle}} onClick={(e) => click(e)} className={styles.outlined + ' ' + styles.disabled}><div className={styles.loader}></div>{children}</button>
    ) : (
      <button style={{...myStyle}} onClick={(e) => click(e)} className={styles.primary + ' ' + styles.disabled}><div className={styles.loader}></div>{children}</button>
    )
  } else if (!loading && disabled) {
    return ButtonVariant.outlined == variant ? (
      <button style={{...myStyle}} onClick={(e) => click(e)} className={styles.outlined + ' ' + styles.disabled}>{children}</button>
    ) : (
      <button style={{...myStyle}} onClick={(e) => click(e)} className={styles.primary + ' ' + styles.disabled}>{children}</button>
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
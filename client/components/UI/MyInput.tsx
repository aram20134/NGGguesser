import styles from '../../styles/MyInput.module.scss'

interface MyInputProps {
    title: string;
    type: string;
    value?: string;
    setValue: Function;
    description?: string;
    myStyle?: object;
}

const MyInput : React.FC<MyInputProps> = ({title, type, value, setValue, description, myStyle}) => {
  return (
    <div className={styles.col}>
        <p>{title}</p>
        <input style={{...myStyle}} value={value} onChange={(e : React.FormEvent<HTMLInputElement>) => setValue(e)} className={styles.inp} type={type} />
        <span className={styles.desc}>{description}</span>
    </div>
  )
}

export default MyInput
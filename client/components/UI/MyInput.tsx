import styles from '../../styles/MyInput.module.scss'

interface MyInputProps {
    title: string;
    type: string;
    value?: string;
    setValue: Function;
    description?: string;
}

const MyInput : React.FC<MyInputProps> = ({title, type, value, setValue, description}) => {
  return (
    <div className={styles.col}>
        <p>{title}</p>
        <input value={value} onChange={(e : React.FormEvent<HTMLInputElement>) => setValue(e)} className={styles.inp} type={type} />
        <span className={styles.desc}>{description}</span>
    </div>
  )
}

export default MyInput
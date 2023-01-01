import styles from "../../styles/SwitchSelector.module.scss";

interface SwitchSelectorProps {
    props: Array<{name: string, onClick: Function, checked?: boolean}>
}

const SwitchSelector : React.FC<SwitchSelectorProps> = ({props}) => {
    
    return (
        <div className={styles.switchSelector}>
            {props.map((p, i) => 
                <label key={p.name}>
                    <span>{p.name}</span>
                    <input defaultChecked={p.checked} onClick={(e) => p.onClick(e)} className={styles.inp} type='radio' name="switch" />
                    <div className={styles.switch}></div>
                </label>
            )}
        </div>
    )
}

export default SwitchSelector
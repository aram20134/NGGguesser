import styles from '../../styles/Tooltip.module.scss'

interface TooltipProps {
    children: React.ReactNode;
    title: string;
    classN?: string;
    myStyle?: Object;
}

const Tooltip : React.FC<TooltipProps> = ({children, title, classN, myStyle}) => {
  return (
    <div style={{position:'relative', display:'flex', justifyContent:'center', ...myStyle}} className={classN + ' ' + styles.tooltip}>
        <div className={styles.helper}>{title}</div>
        {children}
    </div>
  )
}

export default Tooltip
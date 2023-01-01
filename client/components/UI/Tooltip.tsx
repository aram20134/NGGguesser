import styles from '../../styles/Tooltip.module.scss'

interface TooltipProps {
    children: React.ReactNode;
    title: string;
    classN?: string;
}

const Tooltip : React.FC<TooltipProps> = ({children, title, classN}) => {
  return (
    <div style={{position:'relative'}} className={classN + ' ' + styles.tooltip}>
        <div className={styles.helper}>{title}</div>
        {children}
    </div>
  )
}

export default Tooltip
import { useState } from "react"
import styles from '../../styles/Modal.module.scss'

interface ModalProps {
    modalActive: boolean;
    children: React.ReactNode;
    title: string;
    onClose: {name: string, action: Function};
    onSubmit: {name: string, action: Function};
}

const Modal : React.FC<ModalProps> = ({modalActive, children, title, onClose, onSubmit}) => {

    return (
        <div onClick={onClose.action as any} className={styles.modal} style={{display: modalActive && 'flex'}}>
            <div onClick={(e) => e.stopPropagation()} className={styles.modalContent}>
                <h2>{title}</h2>
                {children}
                <div className={styles.modalFooter}>
                    <button onClick={onSubmit.action as any}>{onSubmit.name}</button>
                    <button onClick={onClose.action as any}>{onClose.name}</button>
                </div>
            </div>
        </div>
    )
}

export default Modal
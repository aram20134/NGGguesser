import Link from 'next/link';
import React from 'react'
import styles from '../../styles/MyButton.module.scss'
import { ButtonVariant } from './MyButton';

interface MyButtonLinkProps {
    children: React.ReactNode;
    variant: ButtonVariant;
    link: string;
}

const MyButtonLink : React.FC<MyButtonLinkProps> = ({children, variant, link}) => {
  return ButtonVariant.outlined == variant ? (
    <Link href={link}>
        <a className={styles.outlined}>{children}</a>
    </Link>
  ) : (
    <Link href={link}>
        <a className={styles.primary}>{children}</a>
    </Link>
  )
}

export default MyButtonLink
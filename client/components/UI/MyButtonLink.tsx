import Link from 'next/link';
import styles from '../../styles/MyButton.module.scss'
import { ButtonVariant } from './MyButton';

interface MyButtonLinkProps {
    children: React.ReactNode;
    variant: ButtonVariant;
    link: string;
    myStyle?: object;
}

const MyButtonLink : React.FC<MyButtonLinkProps> = ({children, variant, link, myStyle}) => {
  return ButtonVariant.outlined == variant ? (
    <Link href={link}>
        <a style={{...myStyle}} className={styles.outlined}>{children}</a>
    </Link>
  ) : (
    <Link href={link}>
        <a style={{...myStyle}} className={styles.primary}>{children}</a>
    </Link>
  )
}

export default MyButtonLink
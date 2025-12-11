import styles from './Footer.module.css';
import ClientOnly from './ClientOnly';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <ClientOnly fallback={<p>&copy; ReCreat0rz. All Rights Reserved.</p>}>
                <p>&copy; {new Date().getFullYear()} ReCreat0rz. All Rights Reserved.</p>
            </ClientOnly>
        </footer>
    );
};

export default Footer;

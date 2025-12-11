import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <p suppressHydrationWarning>&copy; {new Date().getFullYear()} ReCreat0rz. All Rights Reserved.</p>
        </footer>
    );
};

export default Footer;

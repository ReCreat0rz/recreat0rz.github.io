import ThemeToggle from './ThemeToggle';
import Link from 'next/link';
import styles from './Header.module.css';

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <Link href="/" style={{ fontFamily: 'sans-serif', fontWeight: 'bold' }}>ReCreat0rz</Link>
            </div>
            <nav className={styles.nav}>
                <ul>
                    <li><Link href="/">Home</Link></li>
                    <li><Link href="/about">About</Link></li>
                    <li><Link href="/posts">Posts</Link></li>
                    <li style={{ display: 'flex', alignItems: 'center' }}><ThemeToggle /></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;

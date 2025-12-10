
import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <h1 style={{
                fontSize: '6rem',
                background: 'linear-gradient(to right, var(--primary-color), var(--accent-color))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: '0 0 1rem 0'
            }}>
                404
            </h1>
            <h2 style={{
                fontSize: '2rem',
                color: 'var(--text-color)',
                marginBottom: '1rem',
                borderBottom: 'none'
            }}>
                Page Not Found
            </h2>
            <p style={{
                color: 'var(--text-secondary)',
                marginBottom: '2rem',
                maxWidth: '500px'
            }}>
                The requested page could not be found. It might have been moved, deleted, or never existed in this timeline.
            </p>
            <Link href="/" style={{
                display: 'inline-block',
                padding: '0.8rem 1.5rem',
                background: 'rgba(192, 132, 252, 0.1)',
                border: '1px solid var(--primary-color)',
                color: 'var(--primary-color)',
                borderRadius: '8px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
            }}>
                Return to System &rarr;
            </Link>
        </div>
    );
}

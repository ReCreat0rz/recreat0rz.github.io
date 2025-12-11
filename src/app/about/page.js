import Image from 'next/image';

export const metadata = {
    title: 'About | ReCreat0rz',
};

export default function About() {
    return (
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem' }}>
            <h1 style={{
                marginBottom: '3rem',
                fontSize: '2.5rem',
                letterSpacing: '-0.05em',
                fontFamily: 'var(--font-mono)',
                color: 'var(--primary-color)',
                textShadow: 'var(--glow-text)',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '1rem',
                display: 'inline-block'
            }}>
                About Me
            </h1>
            <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: '0 0 320px' }}>
                    <Image
                        src="/profile-v2.jpg"
                        alt="Profile Picture"
                        width={320}
                        height={453}
                        style={{
                            borderRadius: '12px',
                            objectFit: 'cover',
                            border: '1px solid var(--border-color)',
                            boxShadow: '0 0 20px rgba(0, 243, 255, 0.1)' // Soft cyber glow
                        }}
                        quality={100}
                        priority
                    />
                </div>
                <div style={{ flex: '1', fontFamily: 'var(--font-mono)' }}>
                    <h2 style={{
                        color: 'var(--accent-color)',
                        marginTop: 0,
                        fontSize: '1.8rem',
                        marginBottom: '1.5rem'
                    }}>
                        recreat0rz
                    </h2>
                    <div style={{ lineHeight: '1.8', color: 'var(--text-color)' }}>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Hi, welcome to my blog! My name is <strong style={{ color: 'white' }}>Raihan</strong>, also known by the codename <strong style={{ color: 'white' }}>rei</strong>. The purpose of this blog is to document and curate my ideas, so I can revisit them in the future in case I forget :D.
                        </p>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Brief explanation about myself:</p>
                        <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                            {[
                                "FPS, RPG, MMORPG, and Turn-Based game enthusiast",
                                "Actively focused on Blockchain-related CTF challenges",
                                "Open to Game-category CTFs and iOS exploitation challenges",
                                "Watching anime and Reading manga enthusiast",
                                "Ineffa Mains"
                            ].map((item, index) => (
                                <li key={index} style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

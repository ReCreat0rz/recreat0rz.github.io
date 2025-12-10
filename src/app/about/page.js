import Image from 'next/image';

export const metadata = {
    title: 'About | ReCreat0rz',
};

export default function About() {
    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
            <h1 style={{ marginBottom: '3rem', fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
                About Me
            </h1>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: '0 0 320px' }}>
                    <Image
                        src="/profile-v2.jpg"
                        alt="Profile Picture"
                        width={320}
                        height={453}
                        style={{ borderRadius: '12px', objectFit: 'cover' }}
                        quality={100}
                        priority
                    />
                </div>
                <div style={{ flex: '1' }}>
                    <h2 style={{ color: 'var(--text-color)', marginTop: 0 }}>recreat0rz</h2>
                    <div style={{ lineHeight: '1.8' }}>
                        <p style={{ marginBottom: '1rem' }}>
                            Hi, welcome to my blog! My name is Raihan, also known by the codename rei. The purpose of this blog is to document and curate my ideas, so I can revisit them in the future in case I forget :D.
                        </p>
                        <p style={{ marginBottom: '0.5rem' }}>Brief explanation about myself:</p>
                        <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            <li>FPS, RPG, MMORPG, and Turn-Based game enthusiast</li>
                            <li>Actively focused on Blockchain-related CTF challenges</li>
                            <li>Open to Game-category CTFs and iOS exploitation challenges</li>
                            <li>Watching anime and Reading manga enthusiast</li>
                            <li>Ineffa Mains</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

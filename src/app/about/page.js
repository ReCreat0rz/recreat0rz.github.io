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
                        src="/ineffa-about.jpg"
                        alt="Ineffa"
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
                            Yo, welcome to my blog!
                            <br />
                            I’ve been in cybersecurity for 3+ years, mainly doing offensive security—which is basically just <strong style={{ color: 'var(--accent-color)' }}>“IT’S NOT A BUG, IT’S A VULNERABILITY SPEEDRUN ANY% - DEV forgot to validate anything — new vuln unlocked.”</strong>
                        </p>
                        <p style={{ marginBottom: '2rem' }}>
                            Most of my learning comes from clicking one thing, everything breaking, and suddenly I'm stuck in <span style={{ color: 'var(--primary-color)' }}>troubleshooting + debugging</span> I never asked for — the true final boss.
                        </p>

                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Lore Dump About Me:</p>
                        <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                            {[
                                "Plays FPS, RPG, MMORPG, and turn-based games because committing to one genre is too mainstream",
                                "Currently trapped in the blockchain CTF saga",
                                "Says “yeah why not” to game CTFs, AI Security CTFs, or iOS exploitation like it’s DLC content",
                                "Watches anime and reads manga for emotional support",
                                "Ineffa mains — no regrets, only pain"
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

import PaginatedPostList from '../../components/PaginatedPostList';
import { getSortedPostsData } from '@/lib/posts';

export default function Posts() {
    const allPostsData = getSortedPostsData();

    return (
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--primary-color)',
                    textShadow: 'var(--glow-text)',
                    marginBottom: '0.5rem'
                }}>
                    All Posts
                </h1>
                <p style={{
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.95rem'
                }}>
                    {allPostsData.length} writeups and notes
                </p>
                <div style={{
                    height: '2px',
                    background: 'linear-gradient(90deg, var(--primary-color), transparent)',
                    marginTop: '1rem',
                    borderRadius: '2px'
                }} />
            </header>

            <PaginatedPostList posts={allPostsData} />
        </div>
    );
}

import PaginatedPostList from '../../components/PaginatedPostList';
import { getSortedPostsData } from '@/lib/posts';

export default function Posts() {
    const allPostsData = getSortedPostsData();

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                Posts
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <PaginatedPostList posts={allPostsData} />
            </div>
        </div>
    );
}

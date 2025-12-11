import Link from 'next/link';
import { format } from 'date-fns';
import styles from './PostCard.module.css';

const PostCard = ({ post }) => {
    return (
        <Link href={`/blog/${post.slug}`} className={styles.card}>
            <h2 className={styles.title}>{post.title}</h2>
            <span className={styles.date} suppressHydrationWarning>{format(new Date(post.date), 'MMMM d, yyyy')}</span>
            <p className={styles.excerpt}>{post.excerpt}</p>
            {post.tags && post.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {post.tags.map(tag => (
                        <span key={tag} style={{
                            fontSize: '0.75rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            color: 'var(--text-secondary)',
                            fontFamily: 'var(--font-mono)'
                        }}>
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </Link>
    );
};

export default PostCard;

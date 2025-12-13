import Link from 'next/link';
import { format } from 'date-fns';
import styles from './PostCard.module.css';

const PostCard = ({ post }) => {
    return (
        <Link href={`/blog/${post.slug}`} className={styles.card}>
            <h2 className={styles.title}>{post.title}</h2>

            <div className={styles.meta}>
                <span className={styles.date} suppressHydrationWarning>
                    {format(new Date(post.date), 'MMMM d, yyyy')}
                </span>
                {post.category && (
                    <span className={styles.category}>
                        {Array.isArray(post.category) ? post.category[0] : post.category}
                    </span>
                )}
            </div>

            <p className={styles.excerpt}>{post.excerpt}</p>

            {post.tags && post.tags.length > 0 && (
                <div className={styles.tags}>
                    {post.tags.slice(0, 4).map(tag => (
                        <span key={tag} className={styles.tag}>
                            #{tag}
                        </span>
                    ))}
                    {post.tags.length > 4 && (
                        <span className={styles.tag}>+{post.tags.length - 4}</span>
                    )}
                </div>
            )}
        </Link>
    );
};

export default PostCard;

import { getPostData, getSortedPostsData } from '@/lib/posts';
import { format } from 'date-fns';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import TableOfContents from '@/components/TableOfContents';
import CodeHighlighter from '@/components/CodeHighlighter';

export async function generateStaticParams() {
    const posts = getSortedPostsData();
    return posts.map((post) => ({
        slug: '' + post.slug,
    }));
}

export default async function Post({ params }) {
    const { slug } = await params;
    let postData;

    try {
        postData = await getPostData(slug);
    } catch (error) {
        notFound();
    }

    return (
        <article className="blog-article">
            <CodeHighlighter />
            <Link href="/" style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem', display: 'block' }}>
                &larr; Back to System
            </Link>

            <header className="blog-header">
                <h1 className="blog-title">{postData.title}</h1>
                <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {format(new Date(postData.date), 'MMMM d, yyyy')} | {postData.category ? (Array.isArray(postData.category) ? postData.category.join(', ') : postData.category) : 'SYSTEM_LOG'}
                </div>
                {postData.tags && postData.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                        {postData.tags.map(tag => (
                            <span key={tag} style={{
                                fontSize: '0.8rem',
                                background: 'rgba(192, 132, 252, 0.15)',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                color: 'var(--primary-color)',
                                fontFamily: 'var(--font-mono)',
                                border: '1px solid rgba(192, 132, 252, 0.3)'
                            }}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </header>

            {/* Mobile TOC - Shows only on mobile, below title */}
            <div className="toc-mobile">
                <TableOfContents contentHtml={postData.contentHtml} />
            </div>

            <div className="blog-layout">
                <div
                    className="blog-content"
                    dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
                    style={{ lineHeight: '1.8', maxWidth: '800px' }}
                />

                {/* Desktop TOC - Shows only on desktop, in sidebar */}
                <aside className="toc-desktop">
                    <TableOfContents contentHtml={postData.contentHtml} />
                </aside>
            </div>

            <div style={{
                marginTop: '4rem',
                paddingTop: '2rem',
                borderTop: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                {postData.prevPost ? (
                    <Link href={`/blog/${postData.prevPost.slug}`} style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textDecoration: 'none' }}>
                        <span style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.2rem' }}>&larr; Previous Post</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{postData.prevPost.title}</span>
                    </Link>
                ) : <div />}

                {postData.nextPost ? (
                    <Link href={`/blog/${postData.nextPost.slug}`} style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right', textDecoration: 'none' }}>
                        <span style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.2rem' }}>Next Post &rarr;</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{postData.nextPost.title}</span>
                    </Link>
                ) : <div />}
            </div>
        </article >
    );
}

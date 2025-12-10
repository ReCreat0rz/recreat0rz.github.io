'use client';

import { useState } from 'react';
import PostCard from './PostCard';

const POSTS_PER_PAGE = 5;

export default function PaginatedPostList({ posts }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter posts based on search query
    const filteredPosts = posts.filter(post => {
        const query = searchQuery.toLowerCase();
        const titleMatch = post.title.toLowerCase().includes(query);
        const excerptMatch = post.excerpt && post.excerpt.toLowerCase().includes(query);
        const tagsMatch = post.tags && post.tags.some(tag => tag.toLowerCase().includes(query));
        return titleMatch || excerptMatch || tagsMatch;
    });

    // Reset pagination when search query changes
    if (currentPage > Math.ceil(filteredPosts.length / POSTS_PER_PAGE) && filteredPosts.length > 0) {
        setCurrentPage(1);
    }

    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const currentPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <input
                    type="text"
                    placeholder="Search posts (title, tags, content)..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1); // Find logic usually resets page on filter change
                    }}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: '#0f0a16',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '1rem',
                        outline: 'none',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '400px' }}>
                {currentPosts.length > 0 ? (
                    currentPosts.map((post) => (
                        <PostCard key={post.slug} post={post} />
                    ))
                ) : (
                    <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', textAlign: 'center', padding: '2rem' }}>
                        data not found
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div style={{
                    marginTop: '3rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        style={{
                            padding: '0.5rem 1rem',
                            background: currentPage === 1 ? 'transparent' : '#333',
                            color: currentPage === 1 ? '#666' : '#fff',
                            border: '1px solid #333',
                            borderRadius: '4px',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            fontFamily: 'var(--font-mono)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        &larr; Previous
                    </button>

                    <span style={{ color: '#666', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        onClick={handleNext}
                        disabled={currentPage >= totalPages}
                        style={{
                            padding: '0.5rem 1rem',
                            background: currentPage >= totalPages ? 'transparent' : '#333',
                            color: currentPage >= totalPages ? '#666' : '#fff',
                            border: '1px solid #333',
                            borderRadius: '4px',
                            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                            fontFamily: 'var(--font-mono)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Next &rarr;
                    </button>
                </div>
            )}
        </div>
    );
}

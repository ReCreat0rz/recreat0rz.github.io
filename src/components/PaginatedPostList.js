'use client';

import { useState, useMemo } from 'react';
import PostCard from './PostCard';

const POSTS_PER_PAGE = 5;

export default function PaginatedPostList({ posts }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedTag, setSelectedTag] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');

    // Extract unique years, categories, and tags from posts
    const filterOptions = useMemo(() => {
        const years = new Set();
        const categories = new Set();
        const tags = new Set();

        posts.forEach(post => {
            const year = new Date(post.date).getFullYear();
            years.add(year);

            if (post.category) {
                const cats = Array.isArray(post.category) ? post.category : [post.category];
                cats.forEach(cat => categories.add(cat));
            }

            if (post.tags) {
                post.tags.forEach(tag => tags.add(tag));
            }
        });

        return {
            years: Array.from(years).sort((a, b) => b - a),
            categories: Array.from(categories).sort(),
            tags: Array.from(tags).sort()
        };
    }, [posts]);

    // Filter and sort posts
    const filteredPosts = useMemo(() => {
        let result = posts.filter(post => {
            const query = searchQuery.toLowerCase();
            const titleMatch = post.title.toLowerCase().includes(query);
            const excerptMatch = post.excerpt && post.excerpt.toLowerCase().includes(query);
            const tagsMatch = post.tags && post.tags.some(tag => tag.toLowerCase().includes(query));

            // Year filter
            if (selectedYear !== 'all') {
                const postYear = new Date(post.date).getFullYear();
                if (postYear !== parseInt(selectedYear)) return false;
            }

            // Category filter
            if (selectedCategory !== 'all') {
                const cats = Array.isArray(post.category) ? post.category : [post.category];
                if (!cats.includes(selectedCategory)) return false;
            }

            // Tag filter
            if (selectedTag !== 'all') {
                if (!post.tags || !post.tags.includes(selectedTag)) return false;
            }

            return titleMatch || excerptMatch || tagsMatch || !searchQuery;
        });

        // Sort
        result.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [posts, searchQuery, selectedYear, selectedCategory, selectedTag, sortOrder]);

    // Reset pagination when filters change
    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
    const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));

    if (safeCurrentPage !== currentPage) {
        setCurrentPage(safeCurrentPage);
    }

    const startIndex = (safeCurrentPage - 1) * POSTS_PER_PAGE;
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

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedYear('all');
        setSelectedCategory('all');
        setSelectedTag('all');
        setSortOrder('newest');
        setCurrentPage(1);
    };

    const hasActiveFilters = searchQuery || selectedYear !== 'all' || selectedCategory !== 'all' || selectedTag !== 'all';

    const selectStyle = {
        padding: '0.6rem 1rem',
        background: '#0f0a16',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        color: '#fff',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.85rem',
        outline: 'none',
        cursor: 'pointer',
        minWidth: '120px'
    };

    return (
        <div>
            {/* Search Bar */}
            <div style={{ marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder="🔍 Search posts..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
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

            {/* Filters Row */}
            <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                {/* Year Filter */}
                <select
                    value={selectedYear}
                    onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
                    style={selectStyle}
                >
                    <option value="all">📅 All Years</option>
                    {filterOptions.years.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>

                {/* Category Filter */}
                <select
                    value={selectedCategory}
                    onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                    style={selectStyle}
                >
                    <option value="all">📁 All Categories</option>
                    {filterOptions.categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                {/* Tag Filter */}
                <select
                    value={selectedTag}
                    onChange={(e) => { setSelectedTag(e.target.value); setCurrentPage(1); }}
                    style={selectStyle}
                >
                    <option value="all">🏷️ All Tags</option>
                    {filterOptions.tags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>

                {/* Sort Order */}
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={selectStyle}
                >
                    <option value="newest">⬇️ Newest First</option>
                    <option value="oldest">⬆️ Oldest First</option>
                </select>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        style={{
                            padding: '0.6rem 1rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '6px',
                            color: '#ef4444',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        ✕ Clear
                    </button>
                )}
            </div>

            {/* Results Count */}
            <div style={{
                marginBottom: '1rem',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem'
            }}>
                Showing {filteredPosts.length} of {posts.length} posts
            </div>

            {/* Posts List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: '400px' }}>
                {currentPosts.length > 0 ? (
                    currentPosts.map((post) => (
                        <PostCard key={post.slug} post={post} />
                    ))
                ) : (
                    <div style={{
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)',
                        textAlign: 'center',
                        padding: '3rem',
                        background: 'var(--card-bg)',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                        No posts found matching your criteria
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{
                    marginTop: '2.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        style={{
                            padding: '0.6rem 1.2rem',
                            background: currentPage === 1 ? 'transparent' : 'var(--card-bg)',
                            color: currentPage === 1 ? '#666' : '#fff',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            fontFamily: 'var(--font-mono)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        ← Previous
                    </button>

                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                        Page {safeCurrentPage} of {totalPages}
                    </span>

                    <button
                        onClick={handleNext}
                        disabled={currentPage >= totalPages}
                        style={{
                            padding: '0.6rem 1.2rem',
                            background: currentPage >= totalPages ? 'transparent' : 'var(--card-bg)',
                            color: currentPage >= totalPages ? '#666' : '#fff',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                            fontFamily: 'var(--font-mono)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}

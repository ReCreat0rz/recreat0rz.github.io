'use client';

import { useState, useMemo } from 'react';
import PostCard from './PostCard';
import styles from './PaginatedPostList.module.css';

const POSTS_PER_PAGE = 5;

export default function PaginatedPostList({ posts }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedTag, setSelectedTag] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);

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
    const activeFilterCount = [selectedYear !== 'all', selectedCategory !== 'all', selectedTag !== 'all'].filter(Boolean).length;

    return (
        <div>
            {/* Search Bar */}
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="🔍 Search posts..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                    }}
                    className={styles.searchInput}
                />
            </div>

            {/* Filter Toggle Button (Mobile) */}
            <button
                className={styles.filterToggle}
                onClick={() => setShowFilters(!showFilters)}
            >
                <span>⚙️ Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
                <span>{showFilters ? '▲' : '▼'}</span>
            </button>

            {/* Filters Row */}
            <div className={`${styles.filtersRow} ${showFilters ? styles.filtersVisible : ''}`}>
                <select
                    value={selectedYear}
                    onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
                    className={styles.filterSelect}
                >
                    <option value="all">📅 Year</option>
                    {filterOptions.years.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>

                <select
                    value={selectedCategory}
                    onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                    className={styles.filterSelect}
                >
                    <option value="all">📁 Category</option>
                    {filterOptions.categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <select
                    value={selectedTag}
                    onChange={(e) => { setSelectedTag(e.target.value); setCurrentPage(1); }}
                    className={styles.filterSelect}
                >
                    <option value="all">🏷️ Tag</option>
                    {filterOptions.tags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>

                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="newest">⬇️ Newest</option>
                    <option value="oldest">⬆️ Oldest</option>
                </select>

                {hasActiveFilters && (
                    <button onClick={clearFilters} className={styles.clearButton}>
                        ✕ Clear
                    </button>
                )}
            </div>

            {/* Results Count */}
            <div className={styles.resultsCount}>
                {filteredPosts.length} of {posts.length} posts
            </div>

            {/* Posts List */}
            <div className={styles.postsList}>
                {currentPosts.length > 0 ? (
                    currentPosts.map((post) => (
                        <PostCard key={post.slug} post={post} />
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                        No posts found
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        className={styles.pageButton}
                    >
                        ←
                    </button>

                    <span className={styles.pageInfo}>
                        {safeCurrentPage} / {totalPages}
                    </span>

                    <button
                        onClick={handleNext}
                        disabled={currentPage >= totalPages}
                        className={styles.pageButton}
                    >
                        →
                    </button>
                </div>
            )}
        </div>
    );
}

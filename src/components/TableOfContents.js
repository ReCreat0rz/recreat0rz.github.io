'use client';

import { useEffect, useState } from 'react';

export default function TableOfContents({ contentHtml }) {
    const [headings, setHeadings] = useState([]);

    useEffect(() => {
        // Parse the content HTML to find headings
        const parser = new DOMParser();
        const doc = parser.parseFromString(contentHtml, 'text/html');
        const elements = doc.querySelectorAll('h2, h3');

        const headingData = Array.from(elements).map((el, index) => {
            const id = el.id || `heading-${index}`;
            // If the heading doesn't have an ID, we'd theoretically need to add it to the rendered content.
            // However, modifying the dangerous HTML prop is tricky. 
            // Better strategy: The parent component should probably handle ID generation or we rely on 'remark-slug'.
            // For now, let's assume we can scroll by text match or just display.

            // Simple approach for this iteration: Just finding them. 
            // To make them linkable, we really need IDs on the source HTML.

            return {
                id,
                text: el.textContent,
                level: el.tagName.toLowerCase()
            };
        });

        setHeadings(headingData);
    }, [contentHtml]);

    if (headings.length === 0) return null;

    return (
        <nav className="toc">
            <h4>Table of Contents</h4>
            <ul>
                {headings.map((heading, index) => (
                    <li key={index} style={{
                        marginLeft: heading.level === 'h3' ? '1rem' : '0'
                    }}>
                        <a
                            href={`#${heading.id}`}
                            onClick={(e) => {
                                e.preventDefault();
                                const element = document.getElementById(heading.id);
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                        >
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

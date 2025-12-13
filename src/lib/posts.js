import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostsData() {
    // Check if directory exists
    if (!fs.existsSync(postsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames.filter(fileName => /\.(md|mdx)$/.test(fileName)).map((fileName) => {
        const id = fileName.replace(/\.(md|mdx)$/, '');

        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        const matterResult = matter(fileContents);

        return {
            slug: id,
            ...matterResult.data,
        };
    });

    return allPostsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
}

export async function getPostData(slug) {
    // Check for .md or .mdx file
    let fullPath = path.join(postsDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) {
        fullPath = path.join(postsDirectory, `${slug}.mdx`);
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');

    const matterResult = matter(fileContents);

    const processedContent = await remark()
        .use(html)
        .process(matterResult.content);
    const contentHtml = processedContent.toString()
        .replace(/<h([23])>(.*?)<\/h\1>/g, (match, level, text) => {
            const id = text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            return `<h${level} id="${id}">${text}</h${level}>`;
        });

    const allPosts = getSortedPostsData();
    const currentPostIndex = allPosts.findIndex((post) => post.slug === slug);

    const nextPost = currentPostIndex > 0 ? allPosts[currentPostIndex - 1] : null;
    const prevPost = currentPostIndex < allPosts.length - 1 ? allPosts[currentPostIndex + 1] : null;

    return {
        slug,
        contentHtml, // Kept for Table of Contents
        content: matterResult.content, // Raw content for MDX
        ...matterResult.data,
        prevPost,
        nextPost,
    };
}

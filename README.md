# System Log: /root/portfolio

> "Security is not a product, but a process."

Welcome to my digital enclave. This repository hosts my personal cybersecurity blog and portfolio, built to resemble a high-security terminal interface while providing a seamless modern web experience.

## 📡 Mission Directive

This platform serves as a central repository for my research, CTF writeups, and cybersecurity insights. It is designed to be:
-   **Immersive**: A "Deep Purple" dark mode aesthetic inspired by Kali Linux and retro terminals.
-   **Fast**: Built on Next.js 16 with static export for lightning-quick load times.
-   **Secure**: Content delivered statically via GitHub Pages.

## 🛠 Tech Stack

The system backbone relies on a modern, type-safe stack:

-   **Core**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Styling**: CSS Modules with a custom responsive design system
-   **Content**: Markdown with `gray-matter` for metadata
-   **Syntax Highlighting**: Custom "Terminal" theme for code blocks
-   **Deployment**: GitHub Actions -> GitHub Pages

## ⚡ Key Features

-   **Terminal Aesthetics**: Custom scrollbars, monospace fonts, and a "Deep Purple" color palette (`#130a23` background).
-   **Dynamic Routing**: Blog posts are statically generated from Markdown files in `posts/`.
-   **Cyber-Aware UI**:
    -   Code blocks look like terminal windows (complete with window controls).
    -   Tags and categories presented as system metadata.
    -   Custom 404 "System Failure" page.
-   **Responsive Design**: Fully functional on mobile devices without sacrificing the hacker audit.

## 🚀 Initialization (Run Locally)

To spin up a local instance of this system:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/ReCreat0rz/recreat0rz.github.io.git
    cd recreat0rz.github.io
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Deploy Development Server**:
    ```bash
    npm run dev
    ```
    Access the system at `http://localhost:3000`.

## 📦 Build & Deployment

This project uses **GitHub Actions** for automated deployment.

1.  Push changes to `main`.
2.  The `.github/workflows/deploy.yml` pipeline triggers automatically.
3.  Next.js builds a static export (`npm run build`).
4.  The `out/` directory is deployed to GitHub Pages.

## 📝 Managing Content

To add a new log entry (blog post):
1.  Create a file in `posts/` (e.g., `new-exploit.md`).
2.  Add frontmatter:
    ```yaml
    ---
    title: 'Analysis of Zero-Day'
    date: '2025-12-11'
    category: 'Research'
    tags: ['exploit', 'zero-day', 'linux']
    ---
    ```
3.  Write your content in Markdown.

---
*End of Line.*

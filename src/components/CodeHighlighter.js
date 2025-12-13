'use client';

import { useEffect } from 'react';
import hljs from 'highlight.js/lib/core';
import solidity from 'highlightjs-solidity';
import cairo from 'highlightjs-cairo';
import javascript from 'highlight.js/lib/languages/javascript';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import python from 'highlight.js/lib/languages/python';

// Import a dark theme (Atom One Dark is popular for Solidity/Crypto)
import 'highlight.js/styles/atom-one-dark.css';

export default function CodeHighlighter() {
    useEffect(() => {
        // Safe registration helper
        const safeRegister = (name, module) => {
            try {
                // Handle various module export formats (ESM/CJS mixups)
                const langFn = module.default || module;

                if (typeof langFn === 'function') {
                    // Test if it returns a valid object or if it's the function itself
                    if (!hljs.getLanguage(name)) {
                        hljs.registerLanguage(name, langFn);
                    }
                } else {
                    console.warn(`[CodeHighlighter] Module for ${name} is not a function:`, langFn);
                }
            } catch (err) {
                console.warn(`[CodeHighlighter] Failed to register ${name}:`, err);
            }
        };

        safeRegister('solidity', solidity);
        safeRegister('cairo', cairo);

        // standard languages
        if (!hljs.getLanguage('javascript')) hljs.registerLanguage('javascript', javascript);
        if (!hljs.getLanguage('bash')) hljs.registerLanguage('bash', bash);
        if (!hljs.getLanguage('json')) hljs.registerLanguage('json', json);
        if (!hljs.getLanguage('python')) hljs.registerLanguage('python', python);

        // Highlight all code blocks
        try {
            hljs.highlightAll();

            // Add Copy Buttons
            document.querySelectorAll('pre').forEach((block) => {
                // Prevent duplicate buttons
                if (block.querySelector('.copy-button')) return;

                // Make container relative for positioning
                block.style.position = 'relative';

                const button = document.createElement('button');
                button.className = 'copy-button';
                button.innerText = 'Copy';
                button.style.position = 'absolute';
                button.style.top = '8px';
                button.style.right = '8px';
                button.style.background = 'rgba(255, 255, 255, 0.1)';
                button.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                button.style.borderRadius = '4px';
                button.style.color = '#ccc';
                button.style.fontSize = '0.75rem';
                button.style.padding = '4px 8px';
                button.style.cursor = 'pointer';
                button.style.transition = 'all 0.2s';
                button.style.fontFamily = 'monospace';

                button.addEventListener('click', async () => {
                    const code = block.querySelector('code')?.innerText || block.innerText;
                    try {
                        await navigator.clipboard.writeText(code);
                        button.innerText = 'Copied!';
                        button.style.background = 'rgba(76, 175, 80, 0.3)'; // Greenish tint
                        button.style.borderColor = 'rgba(76, 175, 80, 0.5)';

                        setTimeout(() => {
                            button.innerText = 'Copy';
                            button.style.background = 'rgba(255, 255, 255, 0.1)';
                            button.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        }, 2000);
                    } catch (err) {
                        console.error('Failed to copy!', err);
                        button.innerText = 'Error';
                    }
                });

                block.appendChild(button);
            });

        } catch (e) {
            console.error("Highlighting failed", e);
        }
    }, []);

    return null;
}

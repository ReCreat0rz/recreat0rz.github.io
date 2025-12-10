'use client';

import { useEffect } from 'react';
import hljs from 'highlight.js/lib/core';
import solidity from 'highlightjs-solidity';
import cairo from 'highlightjs-cairo';
import javascript from 'highlight.js/lib/languages/javascript';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';

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

        // Highlight all code blocks
        try {
            hljs.highlightAll();
        } catch (e) {
            console.error("Highlighting failed", e);
        }
    }, []);

    return null;
}

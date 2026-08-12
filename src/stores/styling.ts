import { defineStore } from "pinia";
import { computed, ref } from "vue";

const githubStyleCSS = `@import url("https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css");
@import url("https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github.min.css");

.markdown-body {
   font-family: "Noto Sans SC", sans-serif;
   font-optical-sizing: auto;
   font-style: normal;
}

.markdown-body > pre.yaml-metadata { display: none; }

.markdown-body pre,
.markdown-body code {
   font-family: "JetBrains Mono", "Noto Sans SC", monospace !important;
   text-wrap: auto !important;
}

.markdown-body pre:has(.language-mermaid) {
   background: none;
   text-align: center;
}

.markdown-body p.katex-block {
   overflow: auto;
}

.markdown-body .katex-display {
   margin: 0.5em 0;
}

.markdown-body sup.footnote-ref a {
   text-decoration: none !important;
   margin-left: 0.1em !important;
   color: #0069c2 !important;
}

.markdown-body section.footnotes {
   font-size: 0.75em !important;
}

.markdown-body section.footnotes .footnote-backref {
   display: none;
}

.markdown-body p.image-only {
   text-align: center;
}

.markdown-body p.image-only > img {
   max-width: 75%;
}

.markdown-body img {
   max-width: 100%;
}

.markdown-body blockquote[alert="Note"] {
   --alert-color: #0969da;
}
.markdown-body blockquote[alert="Tip"] {
   --alert-color: #1a7f37;
}
.markdown-body blockquote[alert="Important"] {
   --alert-color: #8250df;
}
.markdown-body blockquote[alert="Warning"] {
   --alert-color: #9a6700;
}
.markdown-body blockquote[alert="Caution"] {
   --alert-color: #cf222e;
}
.markdown-body blockquote[alert] {
   border-left: 0.25em solid var(--alert-color);
   color: inherit;
   padding: 0.5em 1em;
}
.markdown-body blockquote[alert] > .alert-head {
   color: var(--alert-color);
   font-weight: 700;
   margin-bottom: 0.5em;
}

.markdown-body blockquote[alert] > .alert-head > i {
   font-size: 1.1rem;
}

page-break {
   break-before: page;
}`;

const githubStylePreview = `## Example Markdown Document
With **Markdown**, you can create complex formatting for your documents using a simple, readable syntax. For instance, we can use \`**bold text**\` to create **bold text**.
`;

const publicationStyleCSS = `@import url("https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css");
@import url("https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&family=Noto+Serif+SC:wght@400;500;700&display=swap");

.markdown-body {
   font-family: "Source Serif 4", "Noto Serif SC", Georgia, "Songti SC", serif;
   font-size: 17px;
   line-height: 1.65;
   color: #20201e;
   max-width: 44em;
   margin: 0 auto;
   text-rendering: optimizeLegibility;
   font-optical-sizing: auto;
   letter-spacing: 0.01em;
   word-wrap: break-word;
}

.markdown-body > *:first-child { margin-top: 0 !important; }
.markdown-body > *:last-child { margin-bottom: 0 !important; }

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
   margin-top: 1.8em;
   margin-bottom: 0.9em;
   font-weight: 600;
   line-height: 1.3;
   text-indent: 0;
   color: #1a1a18;
   border: none !important;
}
.markdown-body h1 {
   font-size: 1.9em;
   text-align: center;
   letter-spacing: 0.06em;
   font-weight: 700;
   margin-top: 0;
   margin-bottom: 1.2em;
}
.markdown-body h2 {
   font-size: 1.45em;
   border-bottom: 1px solid #e2dccb !important;
   padding-bottom: 0.35em;
   letter-spacing: 0.04em;
}
.markdown-body h3 { font-size: 1.2em; }
.markdown-body h4 { font-size: 1.05em; font-style: italic; }
.markdown-body h5 { font-size: 1em; }
.markdown-body h6 { font-size: 0.95em; color: #5c5a52; }

.markdown-body a {
   color: #8a5a00 !important;
   text-decoration: underline;
   text-underline-offset: 0.18em;
   text-decoration-thickness: 0.06em;
}
.markdown-body a:hover { color: #5c3d00 !important; }

.markdown-body strong { font-weight: 700; color: #1a1a18; }
.markdown-body em { font-style: italic; }

.markdown-body code {
   font-family: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace;
   font-size: 0.85em;
   background: #f9f7f1;
   border-radius: 3px;
   padding: 0.15em 0.35em;
   color: #3d3a34;
}
.markdown-body pre {
   background: #faf8f3;
   border: 1px solid #eee9de;
   border-radius: 4px;
   padding: 1em 1.2em;
   overflow: auto;
   line-height: 1.55;
   text-indent: 0;
   margin: 16px 0;
}
.markdown-body pre code {
   background: none;
   padding: 0;
   font-size: 0.85em;
}
.markdown-body pre code.hljs { background: transparent; }

.markdown-body blockquote {
   margin: 1.4em 0;
   padding: 0.1em 1.2em;
   color: #4c4a44;
   border-left: 3px solid #c9c0ad;
   font-style: italic;
   text-indent: 0;
}
.markdown-body blockquote p { text-indent: 0; }

.markdown-body ul,
.markdown-body ol {
   padding-left: 1.7em;
   margin: 0.8em 0;
}
.markdown-body li { margin: 0.3em 0; }
.markdown-body li p { text-indent: 0; margin: 0; }

.markdown-body .katex-display {
   margin: 0.5em 0;
}

.markdown-body table {
   border-collapse: collapse;
   border-spacing: 0;
   margin: 1.6em 0;
   width: 100% !important;
   max-width: 100% !important;
   display: table;
   font-size: 0.95em;
   text-indent: 0;
}
.markdown-body th,
.markdown-body td {
   border: none !important;
   border-bottom: 1px solid #e2dccb !important;
   padding: 0.45em 0.8em;
   vertical-align: top;
}
.markdown-body th {
   border-bottom: 2px solid #b9b2a0 !important;
   font-weight: 600;
   letter-spacing: 0.03em;
   text-align: left;
   background: transparent;
}
.markdown-body tr:last-child td { border-bottom: none !important; }
.markdown-body table tr:nth-child(2n) {
    background-color: #fff !important;
}

.markdown-body hr {
   height: 1px;
   border: none;
   background: #d8d1c0;
   margin: 2.2em auto;
   width: 40%;
   text-indent: 0;
}

.markdown-body img {
   max-width: 100%;
   display: block;
   margin: 1.4em auto;
}
.markdown-body p.image-only { text-align: center; }
.markdown-body p.image-only > img { max-width: 78%; }

.markdown-body sup.footnote-ref a {
   font-size: 0.75em;
   text-decoration: none;
   color: #8a5a00;
   margin-left: 0.1em;
}
.markdown-body .footnotes-sep {
   display: none;
}
.markdown-body section.footnotes {
   font-size: 0.82em;
   border-top: 1px solid #d8d1c0;
   margin-top: 2.5em;
   padding-top: 1em;
   color: #55524b;
   text-indent: 0;
}
.markdown-body section.footnotes .footnote-backref { display: none; }

.markdown-body p.katex-block { overflow: auto; text-indent: 0; }

.markdown-body blockquote[alert="Note"] { --alert-color: #8a5a00; }
.markdown-body blockquote[alert="Tip"] { --alert-color: #687a3d; }
.markdown-body blockquote[alert="Important"] { --alert-color: #6a4f9e; }
.markdown-body blockquote[alert="Warning"] { --alert-color: #9a6a00; }
.markdown-body blockquote[alert="Caution"] { --alert-color: #a03a30; }
.markdown-body blockquote[alert] {
   border-left: 3px solid var(--alert-color);
   color: inherit;
   padding: 0.5em 1em;
}
.markdown-body blockquote[alert] > .alert-head {
   color: var(--alert-color);
   font-weight: 700;
   margin-bottom: 0.5em;
}
.markdown-body blockquote[alert] > .alert-head > i { font-size: 1.1rem; }

page-break { break-before: page; }

@media print {
   .markdown-body { background: none; box-shadow: none; }
}
`;

export const presetStyles: {
   [key: string]: string;
} = {
   GitHub: githubStyleCSS,
   Serif: publicationStyleCSS,
};

export const useStyling = defineStore("styling", () => {
   const style = ref(githubStyleCSS),
      preset = computed({
         get() {
            return (
               Object.keys(presetStyles).find(
                  (name) => style.value === presetStyles[name],
               ) ?? null
            );
         },
         set(val) {
            if (val) {
               style.value = presetStyles[val] ?? "";
               preview.value = githubStylePreview;
            }
         },
      }),
      preview = ref(githubStylePreview);
   return { style, preset, preview };
});

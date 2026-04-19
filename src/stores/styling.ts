import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const optionalCSS = {
   hideMetadata: {
      true: `\n.markdown-body > pre.yaml-metadata { display: none; }`,
      false: ''
   },
   singleImage: {
      default: '',
      center: `
.markdown-body p.image-only {
   text-align: center;
}
.markdown-body p.image-only > img {
   max-width: 75%;
}`,
      center_alt: `
.markdown-body p.image-only {
   text-align: center;
}
.markdown-body p.image-only > img {
   max-width: 75%;
}
p.image-only::after {
   content: attr(alt);
   display: block;
   text-align: center;
}
`
   }
};

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

p.image-only::after {
   font-size: 0.9em;
   margin-top: 0.25rem;
   opacity: 0.8;
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

.markdown-body img {
   max-width: 100%;
}

page-break {
   break-before: page;
}`;

const githubStylePreview = `## Example Markdown Document
With **Markdown**, you can create complex formatting for your documents using a simple, readable syntax. For instance, we can use \`**bold text**\` to create **bold text**.

![Markdown Exp](./markdown-exp.svg)
`;

const gaokaoStyleCSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@200..900&display=swap');
@import url("https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github.min.css");

.markdown-body {
   font-family: "Noto Serif SC", "Times New Roman", "宋体", serif;
   line-height: 2em;
}

.markdown-body > pre.yaml-metadata { display: none; }

.markdown-body h1 {
   text-align: center;
   font-family: "黑体", "Noto Sans SC";
   letter-spacing: 1em;
   text-indent: 1em;
   font-size: 1.75rem;
   line-height: 2em;
   border: none;
   margin: 0;
   padding: 0;
}

.markdown-body h2 {
   text-align: center;
   font-family: "Noto Serif SC", "宋体", serif;
   font-size: 1.25rem;
   line-height: 1em;
   font-weight: 700;
   border: none;
   line-height: 1.5em;
   letter-spacing: 1px;
   text-indent: 1px;
   margin: 0;
   padding: 0;
}

.markdown-body h3 {
   font-family: "Noto Serif SC", "宋体", serif;
   font-size: 1rem;
   font-weight: 600;
   font-size: 1.1em;
   margin: 0.75em 0;
   padding: 0;
}

.markdown-body:has(use-song-font) {
   font-family: "Times New Roman", "宋体", serif;
}

.markdown-body:has(use-song-font) h2, .markdown-body:has(use-song-font) h3 {
   font-family: "宋体", serif;
}

selections *:has(> span.katex), selections:has(> span.katex) {
   display: flex;
   justify-content: space-between;
   width: 100%;
   margin: 1em 0;
}

selections span.katex:nth-child(1)::before { content: "A. "; }
selections span.katex:nth-child(2)::before { content: "B. "; }
selections span.katex:nth-child(3)::before { content: "C. "; }
selections span.katex:nth-child(4)::before { content: "D. "; }

.markdown-body flex {
   display: flex;
}

.markdown-body img {
   max-width: 100%;
}

.markdown-body flex p.image-only img {
   max-width: 100% !important;
}

.markdown-body ul, ol {
   padding-inline-start: 2em;
}

.markdown-body blockquote.alert {
   font-family: "Noto Sans SC";
}

.markdown-body blockquote {
   margin: 1em 0;
}

.markdown-body code {
   margin: 0;
   font-size: 85%;
   font-family: "JetBrains Mono";
}

.markdown-body pre {
   background: #f6f8fa;
   padding: 0.8rem 1.2rem;
   line-height: 1.2em;
   margin: 0.5em 0;
   border-radius: 4px;
}

@media print {
   .markdown-body no-print { display: none; }
}
`;

const gaokaoStylePreview = `## 2025 年普通高等学校招生全国统一考试
# 数学

###   本试卷共 12 页，150 分。考试时长 120 分钟。考生务必将答案写在答题卡上，在试卷上作答无效。考试结束后，将本试卷和答题卡一并交回。

## 第一部分

### 一、选择题共 10 小题，每小题 4 分，共 40 分。在每小题列出的四个选项中，选出符合题目要求的一项。

1. 设集合 $M = \\{x \\mid 2x - 1 > 5\\}$，集合 $N = \\{1, 2, 3\\}$，则 $M \\cap N = $ （ ）  

    <selections>

    $\\{1, 2, 3\\}$
    $\\{2, 3\\}$
    $\\{3\\}$
    $\\varnothing$

    </selections>
`;

const latexStyleCSS = `
@font-face {
   font-family: 'CMU Serif Roman';
   src: url('./cmunrm.ttf') format('truetype'); 
   font-weight: normal;
   font-style: normal;
}

@font-face {
   font-family: 'CMU Typewriter Text';
   src: url('./cmuntt.ttf') format('truetype'); 
   font-weight: normal;
   font-style: normal;
}

@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@200..900&display=swap');

.markdown-body {
   font-family: 'CMU Serif Roman', "Noto Serif SC";
}

.markdown-body > pre.yaml-metadata { display: none; }

.markdown-body h1, .markdown-body h2, .markdown-body h3 {
   border: none;
   font-weight: 500;
}

.markdown-body h1 {
   font-size: 1.75rem;
   text-align: center;
   line-height: 1.2;
   margin: 0 0 1.5rem 0;
}

.markdown-body h2 {
   font-size: 1.125rem;
   text-align: center;
   line-height: 1.3;
   margin: 0 0 1rem 0;
}

.markdown-body h3 {
   font-size: 1.375rem;
   line-height: 1.25;
   margin-top: 1.5rem;
   margin-bottom: 0.5rem;
   font-weight: 600;
}

.markdown-body h4 {
   font-size: 1.125rem;
   line-height: 1.25;
   margin-top: 1.25rem;
   margin-bottom: 0.5rem;
   font-weight: 600;
}

.markdown-body p, .markdown-body pre {
   margin: 0.5em 0;
}

.markdown-body table {
  border-collapse: collapse;
  max-width: 80%;
  margin: 1em auto;
  font-size: 1rem;
  line-height: 1.5;
  border-top: 2px solid #000;
  border-bottom: 2px solid #000;
}

.markdown-body table thead tr {
  border-bottom: 1.5px solid #000;
}

.markdown-body table th,
.markdown-body table td {
  padding: 0.4rem 0.75rem;
  text-align: center;
  border: none;
}

.markdown-body table th {
  font-weight: 600;
  white-space: nowrap;
}

.markdown-body table caption {
  caption-side: top;
  text-align: center;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

@media print {
  .markdown-body table {
    page-break-inside: avoid;
  }
}

.markdown-body ol {
   margin-left: 2em;
}

.markdown-body double-column {
   display: block;
   column-count: 2; 
}

.markdown-body hr {
   border: none;
   border-bottom: solid 1px #000;
   margin: 0.5em 0;
}

.markdown-body code {
   font-family: "CMU Typewriter Text";
}

.markdown-body pre {
   border-top: 2px solid #000;
   border-bottom: 2px solid #000;
   padding: 0.5rem 1rem;
   margin: 0 1em;
   background: transparent;
   color: #000;
   font-family: "CMU Typewriter Text", monospace;
   font-size: 0.95em;
   line-height: 1.45;
}

.hljs-keyword,
.hljs-literal,
.hljs-symbol { font-weight: 600; }

.hljs-type, .hljs-built_in { font-weight: 600; }

.hljs-title, .hljs-function { font-weight: 600; }

.hljs-number { font-weight: 500; }

.hljs-comment {
  color: #666;
  font-style: italic;
}

.hljs-attr,
.hljs-attribute,
.hljs-meta,
.hljs-params { color: inherit; }
`;

const latexStylePreview = `# My Document

## Author

## February 4, 2026

### What is this?

This is a LaTeX-style appearance...

\`\`\`c
#include <stdio.h>
int main() {
   printf("Hello, world!");
}
\`\`\`
`;

export const presetStyles: {
   css: string;
   preview: string;
   label: string;
   key: string;
}[] = [
   {
      css: githubStyleCSS,
      preview: githubStylePreview,
      label: "GitHub",
      key: "github",
   },
   {
      css: gaokaoStyleCSS,
      preview: gaokaoStylePreview,
      label: "Gaokao",
      key: "gaokao",
   },
   {
      css: latexStyleCSS,
      preview: latexStylePreview,
      label: "LaTeX",
      key: "latex",
   },
];

export const useStyling = defineStore("styling", () => {
   const style = ref(githubStyleCSS),
      preset = computed({
         get() {
            return presetStyles.find((p) => p.css == style.value)?.key;
         },
         set(val) {
            const preset = presetStyles.find((p) => p.key == val);
            if (preset) {
               style.value = preset.css ?? "";
               preview.value = preset.preview ?? githubStylePreview;
            }
         },
      }),
      preview = ref(githubStylePreview),
      styleDeclaration = ref(""),
      options = ref({
         hideMetadata: true,
         singleImage: 'center' as 'default' | 'center' | 'center_alt'
      });
   return { style, preset, preview, styleDeclaration, options };
});

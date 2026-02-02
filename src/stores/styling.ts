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

const gaokaoStyleCSS = `/* This styling is consistent with the conventions of China's National College Entrance Examination (Gaokao). */
/*
## 2025 年普通高等学校招生全国统一考试
# 数学

###   本试卷共 12 页，150 分。考试时长 120 分钟。考生务必将答案写在答题卡上，在试卷上作答无效。考试结束后，将本试卷和答题卡一并交回。

## 第一部分

### 一、选择题共 10 小题，每小题 4 分，共 40 分。在每小题列出的四个选项中，选出符合题目要求的一项。

1. 设集合 $M = \\{x \\mid 2x - 1 > 5\\}$，集合 $N = \\{1, 2, 3\\}$，则 $M \\cap N = $ （ ）    
<selections>
  $\\text{A. } \\{1, 2, 3\\}$
  $\\text{B. } \\{2, 3\\}$
  $\\text{C. } \\{3\\}$
  $\\text{D. } \\varnothing$
</selections>  
*/

.markdown-body {
   font-family: "Times New Roman", "宋体";
   line-height: 2em;
}
.markdown-body h1 {
   text-align: center;
   font-family: "黑体";
   letter-spacing: 1em;
   text-indent: 1em;
   font-size: 2rem;
   line-height: 2em;
   font-weight: 600;
   border: none;
   margin: 0;
   padding: 0;
}

.markdown-body h2 {
   text-align: center;
   font-family: "宋体";
   font-size: 1.25rem;
   line-height: 1em;
   font-weight: 600;
   border: none;
   line-height: 1.5em;
   letter-spacing: 1px;
   text-indent: 1px;
   margin: 0;
   padding: 0;
}

.markdown-body h3 {
   font-family: "宋体";
   font-size: 1rem;
   font-weight: 800;
   font-size: 1.1em;
   margin: 0.75em 0;
   padding: 0;
}

selections {
   display: flex;
   justify-content: space-between;
   width: 100%;
   margin: 1em 0;
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
`;

const gaokaoStylePreview = `## 2025 年普通高等学校招生全国统一考试
# 数学

###   本试卷共 12 页，150 分。考试时长 120 分钟。考生务必将答案写在答题卡上，在试卷上作答无效。考试结束后，将本试卷和答题卡一并交回。

## 第一部分

### 一、选择题共 10 小题，每小题 4 分，共 40 分。在每小题列出的四个选项中，选出符合题目要求的一项。

1. 设集合 $M = \\{x \\mid 2x - 1 > 5\\}$，集合 $N = \\{1, 2, 3\\}$，则 $M \\cap N = $ （ ）    
<selections>
  $\\text{A. } \\{1, 2, 3\\}$
  $\\text{B. } \\{2, 3\\}$
  $\\text{C. } \\{3\\}$
  $\\text{D. } \\varnothing$
</selections>  
`;

export const presetStyles: {
   [key: string]: {
      css: string;
      preview: string;
   };
} = {
   Github: {
      css: githubStyleCSS,
      preview: githubStylePreview,
   },
   Gaokao: {
      css: gaokaoStyleCSS,
      preview: gaokaoStylePreview,
   },
};

export const useStyling = defineStore("styling", () => {
   const style = ref(githubStyleCSS),
      preset = computed({
         get() {
            return Object.keys(presetStyles).find(
               (name) => style.value == presetStyles[name]?.css,
            );
         },
         set(val) {
            if (val) {
               style.value = presetStyles[val]?.css ?? "";
               preview.value = presetStyles[val]?.preview ?? githubStylePreview;
            }
         },
      }),
      preview = ref(githubStylePreview);
   return { style, preset, preview };
});

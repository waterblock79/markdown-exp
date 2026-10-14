# Markdown 渲染文档

**该文档可供 Agent 阅读，以参考本项目的 Markdown 渲染实现。**  
**This document is for Agent to read and understand the Markdown rendering implementation of this project.**

## 依赖

```bash
pnpm add markdown-it highlight.js @vscode/markdown-it-katex markdown-it-footnote markdown-it-emoji dompurify morphdom mermaid
pnpm add -D @types/markdown-it
```

## 解析

### 基础配置与高亮缓存

实例化 MarkdownIt，使用 `html: true` 放行内联 HTML，定义 `highlight`、使用 highlight.js 渲染代码高亮并缓存结果。

```ts
import markdownIt from "markdown-it";
import hljs from "highlight.js";
import markdownItKatex from "@vscode/markdown-it-katex";
// @ts-ignore
import markdownItFootnote from "markdown-it-footnote";
// @ts-ignore
import { full as markdownItEmoji } from "markdown-it-emoji";
import DOMPurify from "dompurify";

const highlightCache = new Map<string, string>();
const MarkdownIt = markdownIt({
   html: true,
   highlight: (str, lang) => {
      if (lang && hljs.getLanguage(lang)) {
         try {
            if (highlightCache.has(str)) return highlightCache.get(str)!;
            const result = hljs.highlight(str, { language: lang }).value;
            highlightCache.set(str, result);
            return result;
         } catch (err) {}
      }
      return "";
   },
});
```

### 注册插件

```ts
MarkdownIt.use(markdownItKatex);
MarkdownIt.use(markdownItFootnote);
MarkdownIt.use(markdownItEmoji);
```

### 缓存 KaTeX 渲染

```ts
const originalRule = {
   inline: MarkdownIt.renderer.rules.math_inline,
   block: MarkdownIt.renderer.rules.math_block,
   code_block: MarkdownIt.renderer.rules.code_block,
};
const katexCache = {
   inline: new Map<string, string>(),
   block: new Map<string, string>(),
};
if (originalRule.block && originalRule.inline) {
   const getHandler = (type: "inline" | "block") => {
      return (tokens: any[], idx: number, options: any, env: any, slf: any) => {
         const content = tokens[idx].content;
         if (katexCache[type].has(content)) {
            return katexCache[type].get(content)!;
         }
         const renderResult = originalRule[type]!(
            tokens,
            idx,
            options,
            env,
            slf,
         );
         katexCache[type].set(content, renderResult);
         return renderResult;
      };
   };
   MarkdownIt.renderer.rules.math_inline = getHandler("inline");
   MarkdownIt.renderer.rules.math_block = getHandler("block");
}
```

### 注入源码行号

分割视图基于 `data-line` 将预览块和编辑器行对应。

```ts
const lineTagRules = [
   "paragraph_open",
   "heading_open",
   "blockquote_open",
   "list_item_open",
   "table_open",
];
for (const type of lineTagRules) {
   const orig =
      MarkdownIt.renderer.rules[type] ??
      (MarkdownIt.renderer.renderToken.bind(MarkdownIt.renderer) as any);
   MarkdownIt.renderer.rules[type] = (tokens, idx, options, env, self) => {
      const out: string = orig(tokens, idx, options, env, self);
      const map = tokens[idx]?.map;
      if (!map) return out;
      return out.replace(
         /^<([a-zA-Z][\w-]*)((?:\s[^>]*?)?)>$/,
         (_m, tag, attrs) => `<${tag} data-line="${map[0]}"${attrs}>`,
      );
   };
}
```

### Front matter

隐藏 YAML 元数据。

```ts
const resolveYAMLMetadata = (content: string) => {
   const yamlRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*/;
   const match = content.match(yamlRegex);

   if (!match || !match[1]) return content;

   const yamlRaw = match[1];

   return content.replace(
      yamlRegex,
      `<pre class="yaml-metadata">${yamlRaw}</pre>\n`,
   );
};
```

### 净化与 HTML 变换

定义两处额外处理：

1. `transformAlerts`：转换 Alert 块；
2. `transformImageOnly`：独占一行的图片加 `image-only` 类，以便设置居中等 CSS 样式。

```ts
const alertRegexMap: { [key: string]: { r: RegExp; i: string } } = {
   Note: { r: /^\s*\[!NOTE\]/gi, i: "mdi-information-slab-circle-outline" },
   Tip: { r: /^\s*\[!TIP\]/gi, i: "mdi-lightbulb-outline" },
   Important: {
      r: /^\s*\[!IMPORTANT\]/gi,
      i: "mdi-comment-alert-outline",
   },
   Warning: { r: /^\s*\[!WARNING\]/gi, i: "mdi-alert-outline" },
   Caution: { r: /^\s*\[!CAUTION\]/gi, i: "mdi-alert-circle-outline" },
};

const transformAlerts = (html: string): string => {
   const doc = new DOMParser().parseFromString(html, "text/html");
   for (const el of doc.querySelectorAll("blockquote")) {
      const text = el.textContent ?? "";
      for (const alert in alertRegexMap) {
         if (alertRegexMap[alert]!.r.test(text)) {
            el.innerHTML = el.innerHTML.replace(
               new RegExp(`\\[!${alert}\\]`, "i"),
               "",
            );
            el.insertAdjacentHTML(
               "afterbegin",
               `<div class="alert-head"><i class="${alertRegexMap[alert]!.i} mdi mr-1"></i>${alert}</div>`,
            );
            el.setAttribute("alert", alert);
         }
      }
   }
   return doc.body.innerHTML;
};

const transformImageOnly = (html: string): string => {
   const doc = new DOMParser().parseFromString(html, "text/html");
   for (const p of doc.querySelectorAll("p")) {
      const children = Array.from(p.children);
      if (
         children.length === 1 &&
         children[0] instanceof HTMLImageElement &&
         !(p.textContent ?? "").trim()
      ) {
         p.classList.add("image-only");
      }
   }
   return doc.body.innerHTML;
};
```

### 渲染入口

```ts
export const renderMarkdown = (raw: string): string => {
   let html = resolveYAMLMetadata(raw);
   html = MarkdownIt.render(html);
   html = DOMPurify.sanitize(html);
   html = transformImageOnly(html);
   return transformAlerts(html);
};
```

## 渲染主函数 `doRender`

通过 `doRender` 函数将渲染的 HTML 放入页面，并补齐 mermaid、图片渲染。

```ts
import morphdom from "morphdom";
import mermaid from "mermaid";
import { nextTick, ref, toRaw } from "vue";

const raw = defineModel<string>();
const previewer = ref<HTMLDivElement>();

const doRender = async () => {
   const html = renderMarkdown(raw.value || "");
   morphdom(
      previewer.value?.querySelector(".markdown-body")!,
      `<div class="markdown-body">${html}</div>`,
      { childrenOnly: true },
   );

   await nextTick();

   for (const el of previewer.value?.querySelectorAll(".language-mermaid") ?? []) {
      try {
         await mermaid.run({ nodes: [el as HTMLElement] });
      } catch (err) {
         console.error("Failed to render mermaid diagram:", err);
      }
   }

   previewer.value?.querySelectorAll("*[src]").forEach((el) => {
      if (!el.hasAttribute("src") || !props.fileSystem) return;
      let urlStr = el.getAttribute("src")!;
      if (!URL.canParse(urlStr)) {
         const trySetSrc = async () => {
            const file = toRaw(props.fileSystem!.getItem(urlStr));
            if (!(file instanceof FileSystemFile)) {
               console.error("Failed to resolve resource:", urlStr);
               return;
            }
            try {
               if (file.handle instanceof RemoteFileHandle) {
                  el.setAttribute("src", file.handle.url);
               } else if (file.file instanceof File) {
                  el.setAttribute(
                     "src",
                     URL.createObjectURL(file.file as File),
                  );
               } else throw Error("");
            } catch (e) {
               if (await file.updateFile()) trySetSrc();
               else console.error("Failed to fetch File:", urlStr);
            }
         };
         trySetSrc();
      }
   });

   const waitForImages = (container: HTMLElement) => {
      const imgs = Array.from(container.querySelectorAll("img"));

      const promises = imgs.map((img) => {
         if (img.complete) return Promise.resolve();
         return new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
         });
      });

      return Promise.all(promises);
   };

   await waitForImages(previewer.value?.querySelector(".markdown-body")!);
};
```

### 步骤 1：生成 HTML

`renderMarkdown` 把当前 markdown 源码转成净化后的 HTML 字符串，细节见“解析”一节。

### 步骤 2：差异更新 DOM

morphdom 以 `childrenOnly` 模式，把新 HTML 与现有 `.markdown-body` 的差异写回去，复用已有节点，避免整段重建。

### 步骤 3：等待 Vue 刷新

`await nextTick()` 等 Vue 提交这次 DOM 变更，后面的节点查询才能拿到最新结构。

### 步骤 4：渲染 mermaid

逐个处理 `.language-mermaid`，单张图报错只记录日志，不影响其余图表。

### 步骤 5：解析图片路径

遍历带 `src` 的元素。能解析成绝对 URL 的（远程图片）原样保留；相对路径在虚拟文件系统中查询，远程文件用其本身 URL，本地文件转成 blob URL，获取失败就调用 `updateFile` 重试。  
其中 `props.fileSystem`、`FileSystemFile`、`RemoteFileHandle` 是本项目的文件系统抽象。

### 步骤 6：等待图片加载

统计容器内所有 `<img>`，加载完成或失败后本次渲染才结束，保证打印和导出拿到的是完整画面。

## 渲染串行化

实时编辑和打印可能同时触发 `doRender`。`renderDocument` 同一时刻只跑一次；渲染期间内容有变化，结束后再补跑一次。

```ts
let inFlight: Promise<void> | null = null;
let renderedValue = "";

const renderDocument = () => {
   const value = raw.value || "";
   if (inFlight) {
      if (renderedValue !== value) renderedValue = value;
      return inFlight;
   }
   renderedValue = value;
   inFlight = (async () => {
      try {
         let expected;
         do {
            expected = renderedValue;
            await doRender();
         } while (renderedValue !== expected);
      } finally {
         inFlight = null;
      }
   })();
   return inFlight;
};
```

`onMounted` 里用 `watch` 监听 `raw`，内容一变就触发渲染。

```ts
onMounted(() => {
   watch(raw, renderDocument, { immediate: true });
});
```

## 样式

引入 GitHub 的 markdown 与高亮样式，再补上变换所需的几条规则。

```css
@import url("https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css");
@import url("https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github.min.css");

.markdown-body > pre.yaml-metadata { display: none; }
.markdown-body pre:has(.language-mermaid) { background: none; text-align: center; }
.markdown-body p.image-only { text-align: center; }
.markdown-body p.image-only > img { max-width: 75%; }
```

## 导出与打印

打印时隐藏主界面、显示全屏预览，渲染完成后调用 `window.print()`，用 `@media print` 规则控制分页与元素显隐。

导出 HTML 时把本地图片转成 data URL，katex、mermaid、字体、图标引用 CDN，拼成一份独立文档。其模板如下：

```js
// i18n.locale.value = 当前语言环境
// title = 文档标题
// css = 预设 CSS
// body = 渲染后的 HTML
const html = `
<html lang="${i18n.locale.value}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Noto+Sans+SC:wght@100..900&display=swap" rel="stylesheet" />
<style>
${css}
.markdown-body { max-width: 80%; margin: 0 auto; padding: 2em 1.5em; }
</style>
</head>
<body>
${body}
<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"><\/script>
<script>
mermaid.initialize({ startOnLoad: false });
mermaid.run({ nodes: document.querySelectorAll(".language-mermaid") })
   .catch(function (err) {
      console.error("Failed to render mermaid diagram:", err);
   });
<\/script>
</body>
</html>
`;
```

## 本项目位置

- `src/utils/markdown.ts`：解析、净化、HTML 变换。
- `src/components/MarkdownPreview.vue`：DOM 更新、mermaid、图片解析、渲染串行化。
- `src/stores/styling.ts`：预设 CSS。
- `src/views/Local.vue`：导出 HTML 与打印入口。

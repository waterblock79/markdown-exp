import markdownIt from "markdown-it";
import hljs from "highlight.js";
import markdownItKatex from "@vscode/markdown-it-katex";
// @ts-ignore
import markdownItFootnote from "markdown-it-footnote";
// @ts-ignore
import { full as markdownItEmoji } from "markdown-it-emoji";
import DOMPurify from "dompurify";

if (!URL.canParse) {
   URL.canParse = (url: string | URL, base: string | URL) => {
      try {
         new URL(url, base);
         return true;
      } catch (e) {
         return false;
      }
   };
}

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
MarkdownIt.use(markdownItKatex);
MarkdownIt.use(markdownItFootnote);
MarkdownIt.use(markdownItEmoji);

// Patch Math / Code Block 高亮渲染缓存逻辑
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

// Tag block elements with their source start line so the preview can be kept
// in sync with the CodeMirror editor in split view.
const lineTagRules = [
   "paragraph_open",
   "heading_open",
   "blockquote_open",
   "list_item_open",
   "table_open",
];
for (const type of lineTagRules) {
   // Block tokens have no default rule (they fall back to renderToken), so
   // use renderToken as the base when none is registered.
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

/** Wrap YAML front-matter in a hidden `<pre>` so it does not leak into output. */
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

/** GitHub-style alert blockquote markers and their MDI icons. */
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

/**
 * Convert GitHub-style alert blockquotes ([!NOTE] etc.) into styled alerts
 * on the HTML string level, so both the preview and the exported HTML get
 * the same result.
 */
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

/** Mark paragraphs that contain only an image as `image-only` (centered, capped width). */
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

/** Render markdown source into a sanitized `.markdown-body` inner HTML string. */
export const renderMarkdown = (raw: string): string => {
   let html = resolveYAMLMetadata(raw);
   html = MarkdownIt.render(html);
   html = DOMPurify.sanitize(html);
   html = transformImageOnly(html);
   return transformAlerts(html);
};

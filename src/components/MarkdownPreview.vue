<template>
   <div ref="previewer" class="markdown-preview">
      <div class="markdown-body"></div>
      <div :style="{ display: 'none' }">
         <v-icon icon="mdi-information-slab-circle-outline"></v-icon>
         <v-icon icon="mdi-lightbulb-outline"></v-icon>
         <v-icon icon="mdi-comment-alert-outline"></v-icon>
         <v-icon icon="mdi-alert-outline"></v-icon>
         <v-icon icon="mdi-alert-circle-outline"></v-icon>
      </div>
   </div>
</template>

<script lang="ts" setup>
import markdownIt from "markdown-it";
import hljs from "highlight.js";
import markdownItKatex from "@vscode/markdown-it-katex";
// @ts-ignore
import markdownItFootnote from "markdown-it-footnote";
// @ts-ignore
import { full as markdownItEmoji } from "markdown-it-emoji";
import morphdom from "morphdom";
import mermaid from "mermaid";
import { ref, watch, onMounted, toRaw, nextTick } from "vue";
import DOMPurify from "dompurify";
import {
   FileSystemFile,
   RemoteFileHandle,
   type FileSystemFolder,
} from "../utils/FileSystemTypes";

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

const raw = defineModel<string>();
const props = defineProps<{
   fileSystem?: FileSystemFolder;
}>();

const previewer = ref<HTMLDivElement>();

const renderDocument = () => {
   return new Promise<void>(async (resolve) => {
      const resolveYAMLMetadata = (content: string) => {
         const yamlRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*/;
         const match = content.match(yamlRegex);

         if (!match || !match[1]) return content;

         const yamlRaw = match[1];

         return content.replace(yamlRegex, `<pre class="yaml-metadata">${yamlRaw}</pre>\n`);
      };

      let html = raw.value || "";
      html = resolveYAMLMetadata(html);
      html = MarkdownIt.render(html);
      html = DOMPurify.sanitize(html);
      morphdom(
         previewer.value?.querySelector(".markdown-body")!,
         `<div class="markdown-body">${html}</div>`,
         {
            childrenOnly: true,
         },
      );
      console.log(html);

      await nextTick();

      previewer.value
         ?.querySelectorAll("p:has(> img:only-child)")
         .forEach((el) => {
            if (!(el as HTMLParagraphElement).innerText.length) {
               el.classList.add("image-only");
            }
         });

      await mermaid.run({
         querySelector: ".language-mermaid",
      });

      for (const el of previewer.value?.querySelectorAll("blockquote") ?? []) {
         const alertRegexMap: { [key: string]: { r: RegExp; i: string } } = {
            Note: {
               r: /^\s*\[!NOTE\]/gi,
               i: "mdi-information-slab-circle-outline",
            },
            Tip: {
               r: /^\s*\[!TIP\]/gi,
               i: "mdi-lightbulb-outline",
            },
            Important: {
               r: /^\s*\[!IMPORTANT\]/gi,
               i: "mdi-comment-alert-outline",
            },
            Warning: {
               r: /^\s*\[!WARNING\]/gi,
               i: "mdi-alert-outline",
            },
            Caution: {
               r: /^\s*\[!CAUTION\]/gi,
               i: "mdi-alert-circle-outline",
            },
         };
         for (const alert in alertRegexMap) {
            if (alertRegexMap[alert]?.r.test(el.innerText)) {
               el.innerHTML = el.innerHTML.replace(
                  new RegExp(`\\[!${alert}\\]`, "i"),
                  "",
               );
               el.insertAdjacentHTML(
                  "afterbegin",
                  `<div class="alert-head"><i class="${alertRegexMap[alert].i} mdi mr-1"></i>${alert}</div>`,
               );
               el.setAttribute("alert", alert);
            }
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
      resolve();
   });
};

onMounted(() => {
   watch(raw, renderDocument, { immediate: true });
});

defineExpose({
   render: renderDocument,
});
</script>

<style scoped>
.markdown-preview {
   overflow: auto;
   height: 100%;
   background-color: #fff;
}
</style>

<style></style>

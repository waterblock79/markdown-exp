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
// @ts-ignore
import markdownItAttrs from "markdown-it-attrs";
import morphdom from "morphdom";
import mermaid from "mermaid";
import { ref, watch, onMounted, toRaw, nextTick } from "vue";
import DOMPurify from "dompurify";
import {
   FileSystemFile,
   RemoteFileHandle,
   type FileSystemFolder,
} from "../utils/FileSystemTypes";
import { getMetadata, markdownItMetadata } from "../utils/markdown-it/matadata";
import { markdownItAlert } from "../utils/markdown-it/alert";
import { useMessagesStore } from "../stores/messages";
import { presetStyles } from "../stores/styling";

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

const messages = useMessagesStore();

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
MarkdownIt.use(markdownItMetadata);
MarkdownIt.use(markdownItAlert);
MarkdownIt.use(markdownItAttrs);

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

DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
   if (/^on/i.test(data.attrName)) data.keepAttr = false;
   else data.keepAttr = true;
});
DOMPurify.addHook("uponSanitizeElement", (_node, data) => {
   if (/script/i.test(data.tagName)) data.allowedTags[data.tagName] = false;
   else data.allowedTags[data.tagName] = true;
});

const renderDocument = () => {
   return new Promise<void>(async (resolve) => {
      try {
         const metadata = getMetadata(raw.value || "");
         const styleDeclaration = presetStyles.find(p => p.key.toLowerCase() == metadata.style?.toLowerCase());
         let html = raw.value || "";
         
         previewer.value!.querySelectorAll(".scoped-style").forEach(el => el.remove());
         if (styleDeclaration) {
            previewer.value!.insertAdjacentHTML('afterbegin', `<style class="scoped-style"> @scope { ${styleDeclaration.css} }</style>`);
         }
         
         html = MarkdownIt.render(html);
         html = DOMPurify.sanitize(html);
         morphdom(
            previewer.value?.querySelector(".markdown-body")!,
            `<div class="markdown-body">${html}</div>`,
            {
               childrenOnly: true,
            },
         );

         await nextTick();

         previewer.value
            ?.querySelectorAll("p:has(> img:only-child)")
            .forEach((el) => {
               if (!(el as HTMLParagraphElement).innerText.length) {
                  el.classList.add("image-only");
                  el.setAttribute("alt", el.querySelector("img")!.alt);
               }
            });

         await mermaid.run({
            querySelector: ".language-mermaid",
         });

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
      } catch (e) {
         messages.add(
            "Error occurred while rendering the document: " + e,
            "error",
         );
         console.error(e);
      }
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

<style>
.markdown-body blockquote.alert-note {
   --alert-color: #0969da;
}
.markdown-body blockquote.alert-tip {
   --alert-color: #1a7f37;
}
.markdown-body blockquote.alert-important {
   --alert-color: #8250df;
}
.markdown-body blockquote.alert-warning {
   --alert-color: #9a6700;
}
.markdown-body blockquote.alert-caution {
   --alert-color: #cf222e;
}
.markdown-body blockquote.alert {
   border-left: 0.25em solid var(--alert-color);
   color: inherit;
   padding: 0.5em 1em;
}
.markdown-body blockquote.alert > .alert-head {
   color: var(--alert-color);
   font-weight: 700;
   margin-bottom: 0.5em;
}

.markdown-body blockquote[alert] > .alert-head > i {
   font-size: 1.1rem;
}
</style>
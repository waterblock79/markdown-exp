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
import morphdom from "morphdom";
import mermaid from "mermaid";
import { ref, watch, onMounted, toRaw, nextTick } from "vue";
import { renderMarkdown } from "../utils/markdown";
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

const raw = defineModel<string>();
const props = defineProps<{
   fileSystem?: FileSystemFolder;
}>();

const previewer = ref<HTMLDivElement>();

let inFlight: Promise<void> | null = null;
let renderedValue = "";

const doRender = async () => {
   const html = renderMarkdown(raw.value || "");
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
         }
      });

   // Run diagrams individually so a single bad diagram can't break the whole
   // render (mermaid rejects on invalid input or zero-size containers).
   for (const el of previewer.value?.querySelectorAll(".language-mermaid") ?? []) {
      try {
         await mermaid.run({ nodes: [el as HTMLElement] });
      } catch (err) {
         console.error("Failed to render mermaid diagram:", err);
      }
   }

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
};

// Serialize renders so the live watch and the explicit print render can't race.
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
      } catch (err) {
         console.error("Failed to render document:", err);
      } finally {
         inFlight = null;
      }
   })();
   return inFlight;
};

onMounted(() => {
   watch(raw, renderDocument, { immediate: true });
});

defineExpose({
   render: renderDocument,
   previewer,
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

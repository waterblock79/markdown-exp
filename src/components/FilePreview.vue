<template>
   <div class="w-100 h-100 overflow-hidden">
      <v-progress-linear
         indeterminate
         color="primary"
         v-if="loading"
      ></v-progress-linear>
      <div class="w-100 h-100 position-relative" v-if="type == 'markdown'">
         <v-btn-toggle
            mandatory
            variant="plain"
            color="primary"
            density="comfortable"
            class="markdown-preview-switcher position-absolute right-0 mx-8 my-6 bg-white elevation-2 preview-source-toggle"
            v-model="markdownPreviewMode"
         >
            <v-tooltip :text="$t('preview.preview')" location="top">
               <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" icon="mdi-printer" value="preview"></v-btn>
               </template>
            </v-tooltip>
            <v-tooltip :text="$t('preview.source')" location="top">
               <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" icon="mdi-file-edit" value="source"></v-btn>
               </template>
            </v-tooltip>
            <v-tooltip :text="$t('preview.split')" location="top">
               <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" icon="mdi-code-equal" value="split"></v-btn>
               </template>
            </v-tooltip>
         </v-btn-toggle>
         <MarkdownPreview
            v-model="value"
            class="px-12 py-10"
            :file-system="fsFile?.parent"
            v-if="markdownPreviewMode == 'preview'"
         ></MarkdownPreview>
         <MarkdownEditor
            v-model="value"
            v-else-if="markdownPreviewMode == 'source'"
            class="h-100 w-100"
            @change="saveToFile"
         ></MarkdownEditor>
         <div class="split-view" v-else>
            <MarkdownEditor
               ref="editorRef"
               v-model="value"
               class="split-pane"
               @change="saveToFile"
            ></MarkdownEditor>
            <MarkdownPreview
               ref="previewRef"
               v-model="value"
               class="split-pane px-6 py-6"
               :file-system="fsFile?.parent"
            ></MarkdownPreview>
         </div>
      </div>
      <div class="image" v-else-if="type == 'image'">
         <img :src="value" />
      </div>
      <iframe class="embed" v-else-if="type == 'embed'" :src="value"></iframe>
      <div class="unavailable" v-else-if="type == 'unavailable'">
         <v-alert
            class="flex-grow-0"
            :rounded="false"
            :style="{ minHeight: '3.6em' }"
            border
         >
            This file {{ size <= 1024 * 1024 ? "may" : "can" }} not display
            correctly. Please consider
            <a
               :href="value"
               :download="fsFile!.name"
               class="text-primary text-decoration-none font-weight-medium"
               >Downloading it</a
            >.
         </v-alert>
         <iframe
            class="flex-grow-1 border-none"
            v-if="false && size <= 1024 * 1024"
            :src="value"
         ></iframe>
         <div v-else class="flex-grow-1 d-flex align-center justify-center">
            <v-icon
               icon="mdi-file-remove"
               class="opacity-80"
               size="x-large"
            ></v-icon>
         </div>
      </div>
      <div
         v-else
         class="opacity-80 h-100 d-flex align-center user-select-none justify-center flex-column ga-1"
      >
         <v-icon icon="mdi-file-document" size="x-large"></v-icon>
         <span class="text-subtitle-2">{{ $t("workspace.pickAFile") }}</span>
      </div>
   </div>
</template>

<script lang="ts" setup>
import { nextTick, onBeforeUnmount, watch, ref, computed } from "vue";
import MarkdownPreview from "./MarkdownPreview.vue";
import MarkdownEditor from "./MarkdownEditor.vue";
import {
   RemoteFileHandle,
   type FileSystemFile,
} from "../utils/FileSystemTypes";

const loading = ref(false);

const fsFile = defineModel<FileSystemFile | null>();
const size = computed(
   () =>
      fsFile.value?.file?.size ||
      (fsFile.value?.handle as RemoteFileHandle)?.size ||
      Number.MAX_VALUE,
);

type Types = "markdown" | "image" | "embed" | "unavailable" | "none";
const type = ref<Types>("none");
const value = ref("");

const updateFilePreview = async () => {
   if (
      value.value &&
      (type.value === "image" ||
         type.value === "embed" ||
         type.value === "unavailable")
   ) {
      URL.revokeObjectURL(value.value);
   }
   if (!fsFile.value) {
      type.value = "none";
      loading.value = false;
      return;
   }
   loading.value = true;
   const name = fsFile.value.name;
   if (/\.(md|markdown|txt)$/.test(name) || fsFile.value._osFile?.type.startsWith("text")) {
      // Read from memory first (keeps in-progress edits); only hits disk when uncached.
      const text = await fsFile.value.readText();
      loading.value = false;
      if (text !== null) {
         type.value = "markdown";
         value.value = text;
      }
      return;
   }
   await fsFile.value.updateFile();
   const file = fsFile.value.file;
   loading.value = false;
   if (!file) return;
   if (
      /\.(jpe?g|png|gif|bmp|webp|svg?)$/.test(file.name) ||
      file.type.startsWith("image")
   ) {
      type.value = "image";
   } else if (
      file.type.startsWith("text") ||
      file.type.startsWith("video") ||
      file.type === "application/pdf"
   ) {
      type.value = "embed";
   } else {
      type.value = "unavailable";
   }
   if (fsFile.value.handle instanceof RemoteFileHandle) {
      value.value = fsFile.value.handle.url;
   } else value.value = URL.createObjectURL(file);
};

// Load the selected file; in-memory content is reused when already loaded.
watch(fsFile, updateFilePreview, { deep: false, immediate: true });

const props = defineProps<{
   inVirtualWorkspace?: boolean;
}>();

type MarkdownPreviewMode = "preview" | "source" | "split";
const markdownPreviewMode = ref<MarkdownPreviewMode>(
   props.inVirtualWorkspace ? "split" : "preview",
);

/** Sync edits into the in-memory virtual file system (no disk I/O). */
const saveToFile = () => {
   if (fsFile.value && type.value === "markdown") {
      fsFile.value.setText(value.value);
   }
};

// --- Split view: editor scroll drives the preview (one-way sync) ---
const editorRef = ref<InstanceType<typeof MarkdownEditor>>();
const previewRef = ref<InstanceType<typeof MarkdownPreview>>();

let syncRaf = 0;

/** Editor scroll -> align the preview with the top visible source line. */
const syncEditorToPreview = () => {
   const view = editorRef.value?.getView();
   const pv = previewRef.value;
   const container = pv?.previewer;
   if (!view || !container) return;
   // Editor at the very top -> preview snaps back to the top too.
   if (view.scrollDOM.scrollTop <= 2) {
      if (Math.abs(container.scrollTop) > 2) container.scrollTop = 0;
      return;
   }
   const lineBlock = view.lineBlockAtHeight(view.scrollDOM.scrollTop);
   const lineNo = view.state.doc.lineAt(lineBlock.from).number;
   const blocks = container.querySelectorAll<HTMLElement>("[data-line]");
   let target: HTMLElement | null = null;
   for (const b of blocks) {
      const l = Number(b.dataset.line);
      if (!Number.isNaN(l) && l <= lineNo) target = b;
      else break;
   }
   if (!target) return;
   const dest =
      target.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop;
   if (Math.abs(container.scrollTop - dest) > 2) {
      container.scrollTop = dest;
   }
};

let onEditorScroll: (() => void) | null = null;
let bindTries = 0;

const unbindSplitSync = () => {
   const view = editorRef.value?.getView();
   if (view && onEditorScroll) {
      view.scrollDOM.removeEventListener("scroll", onEditorScroll);
   }
   onEditorScroll = null;
};

const bindSplitSync = () => {
   unbindSplitSync();
   const view = editorRef.value?.getView();
   const container = previewRef.value?.previewer;
   if (!view || !container) {
      // Split panes may not be mounted yet; retry once they are.
      if (bindTries++ < 5) requestAnimationFrame(bindSplitSync);
      return;
   }
   bindTries = 0;
   onEditorScroll = () => {
      cancelAnimationFrame(syncRaf);
      syncRaf = requestAnimationFrame(syncEditorToPreview);
   };
   view.scrollDOM.addEventListener("scroll", onEditorScroll, {
      passive: true,
   });
};

watch(
   markdownPreviewMode,
   (mode) => {
      if (mode === "split") {
         bindTries = 0;
         nextTick(bindSplitSync);
      } else unbindSplitSync();
   },
   { immediate: true },
);

onBeforeUnmount(unbindSplitSync);

</script>

<style lang="css" scoped>
.image {
   width: 100%;
   height: 100%;
   display: flex;
   align-items: center;
   justify-content: center;
   user-select: none;
}

.image > img {
   max-height: 75%;
   max-width: 75%;
}

.embed,
.unavailable {
   border: none;
   width: 100%;
   height: 100%;
}

.unavailable {
   display: flex;
   flex-direction: column;
}

.markdown-preview-switcher {
   z-index: 1000000;
   opacity: 0.5;
   transition: opacity 0.2s ease-in-out;
}

.markdown-preview-switcher:hover {
   opacity: 1;
}

.split-view {
   display: flex;
   width: 100%;
   height: 100%;
   overflow: hidden;
}

.split-pane {
   flex: 1;
   height: 100%;
   overflow: auto;
}

.split-view > .split-pane:first-child {
   border-right: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}
</style>

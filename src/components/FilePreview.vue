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
            class="position-absolute right-0 mx-8 my-6 bg-white elevation-2 preview-source-toggle"
            v-model="markdownPreviewMode"
         >
            <v-btn icon="mdi-printer" value="preview"></v-btn>
            <v-btn icon="mdi-code-equal" value="source"></v-btn>
         </v-btn-toggle>
         <MarkdownPreview
            v-model="value"
            class="px-12 py-10"
            :file-system="fsFile?.parent"
            v-if="markdownPreviewMode == 'preview'"
         ></MarkdownPreview>
         <pre
            v-html="markdownSourceHTML"
            v-else
            class="font-monospace text-pre-wrap px-6 py-5 overflow-auto h-100"
         ></pre>
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
            v-if="size <= 1024 * 1024"
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
import { watch, ref, computed } from "vue";
import MarkdownPreview from "./MarkdownPreview.vue";
import {
   RemoteFileHandle,
   type FileSystemFile,
} from "../utils/FileSystemTypes";
import hljs from "highlight.js";

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
   } else {
      loading.value = true;
      await fsFile.value.updateFile();
      const file = fsFile.value.file;
      loading.value = false;
      if (!file) return;
      if (/\.(md|markdown|txt)$/.test(file.name)) {
         type.value = "markdown";
         value.value = await file.text();
      } else {
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
      }
   }
};

watch(fsFile, updateFilePreview, { deep: false, immediate: true });

const markdownPreviewMode = ref("preview" as "preview" | "source");
const markdownSourceHTML = ref("");
watch(
   value,
   () => {
      markdownSourceHTML.value = hljs.highlight(value.value, {
         language: "markdown",
      }).value;
   },
   { immediate: true },
);
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
</style>

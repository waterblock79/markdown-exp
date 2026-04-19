<template>
   <div
      v-if="fullscreenPreview.isDisplay"
      class="position-fixed w-100 h-100 left-0 top-0 d-flex justify-center align-center fullscreen-preview-back"
   >
      <v-btn
         prepend-icon="mdi-arrow-left"
         variant="text"
         @click="fullscreenPreview.isDisplay = false"
      >
         Back
      </v-btn>
   </div>
   <v-app v-show="!fullscreenPreview.isDisplay">
      <v-main class="h-100 position-relative">
         <Main></Main>
         <v-snackbar-queue v-model="messages.queue"></v-snackbar-queue>
      </v-main>
   </v-app>
   <MarkdownPreview
      id="fullscreen-preview"
      ref="fullscreenPreviewElement"
      v-model="fullscreenPreview.value"
      :file-system="fullscreenPreview.file?.parent"
      v-show="fullscreenPreview.isDisplay"
   ></MarkdownPreview>
</template>

<script setup lang="ts">
import Main from "./views/Main.vue";
import { useMessagesStore } from "./stores/messages";
import MarkdownPreview from "./components/MarkdownPreview.vue";
import { useFullscreenPreview } from "./stores/fullscreen-preview";
import { onMounted, ref, watch } from "vue";
import { optionalCSS, presetStyles, useStyling } from "./stores/styling";

const styling = useStyling();
const messages = useMessagesStore();
const fullscreenPreview = useFullscreenPreview();
const fullscreenPreviewElement = ref<InstanceType<
   typeof MarkdownPreview
> | null>(null);

onMounted(() => {
   fullscreenPreview.renderFunction =
      fullscreenPreviewElement.value?.render ?? null;
   const styleEl = document.createElement("style");
   document.head.append(styleEl);
   watch(
      styling,
      (styling) => {
         const declaration = presetStyles.find(
            (p) => p.key == styling.styleDeclaration,
         );
         const optionalStyle = optionalCSS['singleImage'][styling.options.singleImage] + optionalCSS['hideMetadata'][styling.options.hideMetadata ? 'true' : 'false'];
         if (declaration) {
            styleEl.innerHTML = declaration.css + optionalStyle ;
         } else {
            styleEl.innerHTML = styling.style + optionalStyle;
         }
      },
      { immediate: true },
   );
});
</script>

<style>
body::-webkit-scrollbar {
   display: none;
}

#app {
   position: fixed;
   height: 100%;
   width: 100%;
   left: 0;
   top: 0;
}

#fullscreen-preview {
   display: none;
}

@media print {
   .fullscreen-preview-back {
      display: none !important;
      opacity: 0;
   }
   #fullscreen-preview {
      display: block !important;
      z-index: 10000;
   }
   .v-application {
      display: none !important;
   }
   ::-webkit-scrollbar {
      display: none;
   }
   #app {
      position: relative;
      padding: 1.6em 2.4em;
   }
}

.font-monospace {
   font-family:
      "JetBrains Mono", "Noto Sans SC", Consolas, "Courier New", Courier,
      monospace;
}

.letter-spacing-1 {
   letter-spacing: 1px !important;
}

.user-select-none {
   user-select: none;
}
</style>

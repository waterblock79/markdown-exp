<template>
   <div class="welcome-layout">
      <div class="frame-writing">
         <div class="writing-window">
            <v-layout style="height: 32px">
               <v-system-bar window>
                  <v-spacer></v-spacer>

                  <v-btn icon="mdi-minus" variant="text" size="small"></v-btn>

                  <v-btn class="ms-2" icon="mdi-checkbox-blank-outline" variant="text" size="small"></v-btn>

                  <v-btn class="ms-2" icon="mdi-close" variant="text" size="small"></v-btn>
               </v-system-bar>
            </v-layout>
            <v-sheet>
               <v-tabs density="compact" class="font-monospace">
                  <v-tab value="one" prepend-icon="mdi-file-document">document.md</v-tab>
                  <v-tab value="two" prepend-icon="mdi-image">image.svg</v-tab>
               </v-tabs>

               <v-divider></v-divider>

               <v-tabs-window :v-model="'one'">
                  <code class="pa-4 font-monospace text-pre-line" :style="{ minHeight: '25em' }"
                     ref="markdownSource"></code>
               </v-tabs-window>
            </v-sheet>
         </div>
         <div class="writing-preview elevation-2 shine-btn" :style="{'--surface-hover-opacity': 0.15}">
            <MarkdownPreview v-model="outputText" :file-system="vFileSystem"></MarkdownPreview>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import hljs from "highlight.js";
import MarkdownPreview from "../components/MarkdownPreview.vue";
import { FileSystemFolder, FileSystemFile } from "../utils/FileSystemTypes.ts";
import { i18n } from "../i18n.ts";

const vFileSystem = new FileSystemFolder('', []);
vFileSystem.putItem(new FileSystemFile('image.svg', {
   url: './example-image.svg',
   size: 0
}, vFileSystem));

const markdownSource = ref<HTMLElement | null>(null);
const sourceText = i18n.global.t('starting.exampleDocument');
const outputText = ref<string>("");

onMounted(() => {
   // typing effect for Markdown source code
   const typeNextChar = () => {
      if (outputText.value.length < sourceText.length) {
         let char = sourceText[outputText.value.length];
         outputText.value += char;
         markdownSource.value!.innerHTML = hljs.highlight(outputText.value, { language: "markdown" }).value;
         setTimeout(typeNextChar, 0); // Math.random() * 40 + 10);
      }
   };
   typeNextChar();
});
</script>

<style scoped>
.welcome-layout {
   width: 100%;
}

.welcome-layout {
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 2em;
}

.writing-window {
   width: 25em;
   min-height: 25em;
   background-color: #fff;
   border-radius: 4px;
   border: 1px solid #e0e0e0;
   overflow: hidden;
   pointer-events: none;
   user-select: none;
}

.frame-writing {
   display: flex;
   flex-direction: row;
   align-items: stretch;
   gap: 1em;
}

.writing-preview {
   max-width: 25em;
   background-color: #fff;
   border: 1px solid #e0e0e0;
   overflow: hidden;
   padding: 2em 2em;
   margin: 1em;
}

.welcome-layout {
   padding: 32px;      
}

@media (max-width: 768px) {
   .writing-window {
      display: none;
   }
   .welcome-layout {
      padding: 8px;
   }
}
</style>
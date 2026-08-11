<template>
   <div class="pa-2 h-100 d-flex flex-column">
      <v-select
         class="flex-grow-0"
         :label="t('styleEditor.presets')"
         :items="Object.keys(presetStyles)"
         variant="outlined"
         v-model="styling.preset"
      ></v-select>
      <div class="d-flex ga-4 flex-grow-1 h-75">
         <v-textarea
            class="font-monospace h-100"
            label="CSS"
            no-resize
            variant="outlined"
            v-model="styling.style"
         ></v-textarea>
         <div class="w-50 pa-4 overflow-auto h-100">
            <MarkdownPreview v-model="styling.preview"></MarkdownPreview>
         </div>
      </div>
   </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { presetStyles, useStyling } from "../stores/styling";
import MarkdownPreview from "./MarkdownPreview.vue";

const styling = useStyling();
const { t } = useI18n();
</script>

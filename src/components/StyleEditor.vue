<template>
   <div class="pa-2 h-100 d-flex flex-column">
      <v-select
         class="flex-grow-0"
         :label="t('styleEditor.presets')"
         :items="presetStyles"
         item-value="key"
         item-title="label"
         variant="outlined"
         v-model="styling.preset"
      ></v-select>
      <div class="d-flex ga-4 flex-grow-1 h-75">
         <v-textarea
            class="font-monospace"
            label="CSS"
            no-resize
            variant="outlined"
            v-model="styling.style"
         ></v-textarea>
         <div class="w-50 pa-4 overflow-auto h-100">
            <MarkdownPreview v-model="styling.preview"></MarkdownPreview>
         </div>
      </div>
      <div>
         <div class="text-subtitle-2 mb-4">{{ $t("styleEditor.options") }}</div>
         <div class="d-flex ga-8">
            <v-select
               v-model="styling.options.singleImage"
               :items="['default', 'center', 'center_alt']"
               :label="t('styleEditor.singleImageLabel')"
               :item-title="(item) => t(`styleEditor.singleImage.${item}`)"
               :item-value="item => item"
               variant="outlined"
               density="comfortable"
            >
            </v-select>
            <v-checkbox
               :label="t('styleEditor.hideMeta')"
               v-model="styling.options.hideMetadata"
               color="primary"
               density="comfortable"
            >
            </v-checkbox>
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

<template>
   <div class="markdown-editor h-100 w-100" ref="hostRef"></div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
   EditorView,
   lineNumbers,
   highlightActiveLine,
   keymap,
} from "@codemirror/view";
import {
   defaultKeymap,
   history,
   historyKeymap,
   indentWithTab,
} from "@codemirror/commands";
import {
   bracketMatching,
   defaultHighlightStyle,
   syntaxHighlighting,
} from "@codemirror/language";
import { markdown } from "@codemirror/lang-markdown";

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{
   (e: "update:modelValue", value: string): void;
   (e: "change"): void;
}>();

const hostRef = ref<HTMLElement>();
let view: EditorView | null = null;
let loaded = false;

onMounted(() => {
   // Only the needed extensions are imported (avoids basicSetup bloat).
   view = new EditorView({
      doc: props.modelValue,
      parent: hostRef.value!,
      extensions: [
         lineNumbers(),
         highlightActiveLine(),
         history(),
         bracketMatching(),
         EditorView.lineWrapping,
         syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
         keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
         markdown(),
         EditorView.updateListener.of((update) => {
            if (update.docChanged) {
               emit("update:modelValue", update.state.doc.toString());
               emit("change");
            }
         }),
         EditorView.theme({
            "&": { height: "100%" },
            ".cm-scroller": { overflow: "auto" },
         }),
      ],
   });
   loaded = true;
});

// Sync external changes (e.g. switching files) into the editor.
watch(
   () => props.modelValue,
   (val) => {
      if (view && loaded && val !== view.state.doc.toString()) {
         view.dispatch({
            changes: { from: 0, to: view.state.doc.length, insert: val },
         });
      }
   },
);

onBeforeUnmount(() => {
   view?.destroy();
   view = null;
});

defineExpose({
   getView: () => view,
});
</script>

<style lang="css" scoped>
.markdown-editor :deep(.cm-editor *) {
   font-family: "JetBrains Mono", "Noto Sans SC", var(--v-font-family, ui-sans-serif, system-ui),
      monospace !important;
}

.markdown-editor :deep(.cm-content),
.markdown-editor :deep(.cm-gutters) {
   min-height: 100%;
}
</style>

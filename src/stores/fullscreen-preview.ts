import { defineStore } from "pinia";
import { nextTick, ref } from "vue";
import { FileSystemFile } from "../utils/FileSystemTypes";

export const useFullscreenPreview = defineStore("fullscreen-preview", () => {
   const file = ref<FileSystemFile | null>(null),
      isDisplay = ref(false),
      value = ref("");
   const renderFunction = ref<Function | null>(null);

   const display = async (f: FileSystemFile) => {
      isDisplay.value = true;
      file.value = f;
      try {
         value.value = (await f.file?.text()) || "";
      } catch (e) {
         if (await f.updateFile()) {
            display(f);
            return;
         }
      }
      if (renderFunction.value) await renderFunction?.value();
      await nextTick();
      window.print();
      isDisplay.value = false;
   };

   return { file, isDisplay, value, renderFunction, display };
});

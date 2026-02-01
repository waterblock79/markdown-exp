import { defineStore } from "pinia";
import { ref } from "vue";

export const useMessagesStore = defineStore("messages", () => {
   const queue = ref<{ text: string; color?: string; timeout?: number }[]>([]);
   const add = (text: string, color?: string, timeout: number = 2000) => {
      queue.value.push({
         text,
         color,
         timeout,
      });
   };
   return { queue, add };
});

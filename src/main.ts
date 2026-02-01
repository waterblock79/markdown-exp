import { createApp } from "vue";

// Vuetify
// @ts-ignore
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "@mdi/font/css/materialdesignicons.css";
import "@fontsource/roboto/100.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@fontsource/roboto/900.css";

// Pinia
import { createPinia } from "pinia";

// Components
import App from "./App.vue";
import { i18n } from "./i18n";

createApp(App)
   .use(
      createVuetify({
         components,
         directives,
         icons: {
            defaultSet: "mdi",
         },
      }),
   )
   .use(createPinia())
   .use(i18n)
   .mount("#app");

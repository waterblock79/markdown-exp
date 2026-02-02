import { defineConfig } from 'vite'
// import basicSsl from '@vitejs/plugin-basic-ssl';
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(), 
    // basicSsl()
  ],
  base: '/markdown-exp/'
})

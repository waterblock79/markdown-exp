import { defineConfig, loadEnv } from 'vite'
// import basicSsl from '@vitejs/plugin-basic-ssl';
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [
      vue(),
      // basicSsl()
    ],
    base: env.VITE_BASE_URL ?? '/markdown-exp/'
  }
})

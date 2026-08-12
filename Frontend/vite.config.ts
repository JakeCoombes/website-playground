import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

process.env.BROWSERSLIST_IGNORE_OLD_DATA = '1'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})

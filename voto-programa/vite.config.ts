import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { configDefaults } from 'vitest/config'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  // `vite build --mode artefato`: um único JS (sem import dinâmico) para o protótipo em HTML único
  build:
    mode === 'artefato'
      ? { outDir: 'dist-artefato', rolldownOptions: { output: { inlineDynamicImports: true } } }
      : undefined,
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    // e2e/ roda no Playwright (npm run test:e2e); pipeline/ tem esqueletos e scripts próprios
    exclude: [...configDefaults.exclude, 'e2e/**', 'pipeline/**'],
  },
}))

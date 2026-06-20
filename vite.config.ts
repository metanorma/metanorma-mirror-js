import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

const sharedOutput = {
  globals: { vue: 'Vue' },
  assetFileNames: 'assets/[name][extname]',
}

export default defineConfig({
  plugins: [
    vue(),
    dts({
      entryRoot: 'src',
      outDir: 'dist',
      include: ['src/**/*.ts', 'src/**/*.vue'],
    }),
  ],
  build: {
    lib: {
      entry: {
        mirror: resolve(__dirname, 'src/index.ts'),
        vue: resolve(__dirname, 'src/vue/index.ts'),
      },
    },
    rollupOptions: {
      external: ['vue', '@plurimath/plurimath'],
      output: [
        {
          ...sharedOutput,
          format: 'es',
          entryFileNames: '[name].js',
          chunkFileNames: 'chunks/[name].js',
        },
        {
          ...sharedOutput,
          format: 'cjs',
          entryFileNames: '[name].cjs',
          chunkFileNames: 'chunks/[name].cjs',
        },
      ],
    },
  },
})

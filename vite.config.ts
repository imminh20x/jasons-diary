import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { codeInspectorPlugin } from 'code-inspector-plugin'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    ...(mode === 'development'
      ? [
          codeInspectorPlugin({ bundler: 'vite' }),
          babel({
            plugins: [['@locator/babel-jsx/dist', { env: 'development' }]],
          }),
        ]
      : []),
    react(),
  ],
}))

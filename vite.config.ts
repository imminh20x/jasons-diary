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
  build: {
    chunkSizeWarningLimit: 500,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'supabase', test: /node_modules\/@supabase\// },
            { name: 'markdown', test: /node_modules\/(react-markdown|micromark|mdast|unist|remark|vfile|hast|property-information|space-separated-tokens|comma-separated-tokens|decode-named-character-reference|character-entities)/ },
            { name: 'i18n', test: /node_modules\/(i18next|react-i18next)\// },
            { name: 'vendor', test: /node_modules\// },
          ],
        },
      },
    },
  },
}))

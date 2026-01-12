import eslintJs from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginHtml from 'eslint-plugin-html'
import pluginI18nJson from 'eslint-plugin-i18n-json'
import pluginJsonc from 'eslint-plugin-jsonc'
import neostandard from 'neostandard'
import babelParser from '@babel/eslint-parser'
import vueParser from 'vue-eslint-parser'
const { configs: js } = eslintJs

// Common rules shared between JS and Vue files
const commonRules = {
  indent: ['error', 2, { SwitchCase: 1, ignoreComments: true }],
  '@stylistic/indent': ['error', 2, { SwitchCase: 1, ignoreComments: true }],
  semi: ['error', 'never'],
  'no-return-await': 'error',
  'no-return-assign': 'error',
  'no-new': 'error',
  'arrow-parens': 'off',
  'no-console': 'off',
  'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  'require-atomic-updates': 'off',
  'prefer-const': 'off',
  'no-mixed-operators': 'off',
  'no-prototype-builtins': 'off',
  'space-before-function-paren': ['error', 'never'],
  '@stylistic/space-before-function-paren': ['error', 'never']
}

export default [
  // Global ignores - must be first
  {
    ignores: [
      'node_modules/**',
      'src/muya/**',
      'out/**',
      'dist/**',
      'src/renderer/src/assets/symbolIcon/**'
    ]
  },

  // 0. ESLint core recommended rules
  js.recommended,

  // 1. Use neostandard
  ...neostandard(),

  // 2. Vue plugin configs
  ...pluginVue.configs['flat/recommended'],

  // 3. JS files configuration
  {
    files: ['**/*.js', '**/*.mjs'],
    ignores: ['**/*.vue'],
    plugins: {
      html: pluginHtml
    },
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        MARKTEXT_VERSION_STRING: 'readonly',
        MARKTEXT_VERSION: 'readonly',
        __static: 'readonly'
      }
    },
    rules: commonRules
  },

  // 4. Vue files configuration
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: babelParser,
        requireConfigFile: false,
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        MARKTEXT_VERSION_STRING: 'readonly',
        MARKTEXT_VERSION: 'readonly',
        __static: 'readonly'
      }
    },
    rules: {
      ...commonRules,
      'vue/multi-word-component-names': 'off'
    }
  },

  // 5. Renderer files - add browser globals
  {
    files: ['src/renderer/**/*.js', 'src/renderer/**/*.vue'],
    languageOptions: {
      globals: {
        localStorage: 'readonly',
        FileReader: 'readonly',
        requestAnimationFrame: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        Image: 'readonly',
        URL: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        DOMParser: 'readonly',
        XMLHttpRequest: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        MutationObserver: 'readonly',
        ResizeObserver: 'readonly',
        IntersectionObserver: 'readonly',
        getComputedStyle: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        atob: 'readonly',
        btoa: 'readonly'
      }
    }
  },

  // 6. JSON files basic validation
  ...pluginJsonc.configs['flat/recommended-with-json'],

  // 7. i18n JSON files validation
  {
    files: ['src/shared/i18n/locales/*.json'],
    plugins: {
      'i18n-json': pluginI18nJson
    },
    rules: {
      'i18n-json/valid-json': 'error',
      'i18n-json/sorted-keys': 'warn',
      'i18n-json/identical-keys': [
        'error',
        {
          filePath: 'src/shared/i18n/locales/en.json'
        }
      ]
    }
  }
]

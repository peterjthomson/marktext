import eslintJs from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginHtml from 'eslint-plugin-html'
import pluginI18nJson from 'eslint-plugin-i18n-json'
import pluginJsonc from 'eslint-plugin-jsonc'
import neostandard from 'neostandard'
import babelParser from '@babel/eslint-parser'
const { configs: js } = eslintJs

export default [
  // Global ignores (must be first)
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'out/**',
      'test-results/**',
      'src/muya/dist/**',
      'src/muya/webpack.config.js',
      'static/locales/*.min.json',
      // Third-party/vendor libraries
      'src/muya/lib/assets/libs/**'
    ]
  },

  // 0. ESLint core recommended rules

  js.recommended,
  // 1. Use neostandard instead
  ...neostandard(),

  ...pluginVue.configs['flat/recommended'],

  // 3. JavaScript file overrides (apply babel parser only to JS files, not Vue)
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
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
        // MarkText globals
        MARKTEXT_VERSION_STRING: 'readonly',
        MARKTEXT_VERSION: 'readonly',
        __static: 'readonly',
        // Browser globals for renderer process
        localStorage: 'readonly',
        FileReader: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        Image: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        FormData: 'readonly',
        fetch: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        MutationObserver: 'readonly',
        ResizeObserver: 'readonly',
        IntersectionObserver: 'readonly',
        CustomEvent: 'readonly',
        HTMLElement: 'readonly',
        Element: 'readonly',
        Node: 'readonly',
        NodeList: 'readonly',
        NodeFilter: 'readonly',
        DOMParser: 'readonly',
        XMLHttpRequest: 'readonly',
        getComputedStyle: 'readonly',
        matchMedia: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        queueMicrotask: 'readonly',
        performance: 'readonly'
      }
    },
    rules: {
      indent: ['error', 2, { SwitchCase: 1, ignoreComments: true }],
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
      // Disable conflicting rules from neostandard
      'space-before-function-paren': 'off',
      '@stylistic/space-before-function-paren': 'off',
      '@stylistic/indent': 'off',
      // Allow loose equality for legacy code
      eqeqeq: 'warn'
    }
  },

  // 4. Vue files overrides (globals and rules for Vue)
  {
    files: ['**/*.vue'],
    languageOptions: {
      globals: {
        // MarkText globals
        MARKTEXT_VERSION_STRING: 'readonly',
        MARKTEXT_VERSION: 'readonly',
        __static: 'readonly',
        // Browser globals for renderer process
        localStorage: 'readonly',
        FileReader: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        Image: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        FormData: 'readonly',
        fetch: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        MutationObserver: 'readonly',
        ResizeObserver: 'readonly',
        IntersectionObserver: 'readonly',
        CustomEvent: 'readonly',
        HTMLElement: 'readonly',
        Element: 'readonly',
        Node: 'readonly',
        NodeList: 'readonly',
        NodeFilter: 'readonly',
        DOMParser: 'readonly',
        XMLHttpRequest: 'readonly',
        getComputedStyle: 'readonly',
        matchMedia: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        queueMicrotask: 'readonly',
        performance: 'readonly'
      }
    },
    rules: {
      indent: ['error', 2, { SwitchCase: 1, ignoreComments: true }],
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
      'space-before-function-paren': 'off',
      '@stylistic/space-before-function-paren': 'off',
      '@stylistic/indent': 'off',
      // Disable pedantic Vue rules
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn'
    }
  },

  // 5. JSON files basic validation
  ...pluginJsonc.configs['flat/recommended-with-json'],

  // 6. i18n JSON files validation
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

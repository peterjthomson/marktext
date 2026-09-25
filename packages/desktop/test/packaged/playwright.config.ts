import { defineConfig } from '@playwright/test'

export default defineConfig({
  testMatch: 'launch.spec.ts',
  workers: 1,
  timeout: 60000
})

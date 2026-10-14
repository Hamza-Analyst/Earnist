import { defineConfig, devices } from '@playwright/test';
const port=Number(process.env.EARNIST_TEST_PORT||5173);
const url=`http://127.0.0.1:${port}`;
export default defineConfig({
  testDir: './tests', fullyParallel: false, workers: 1,
  use: { baseURL: url, trace: 'retain-on-failure', launchOptions: process.env.EARNIST_CHROME_PATH ? { executablePath: process.env.EARNIST_CHROME_PATH } : { channel: 'chrome' } },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], defaultBrowserType: 'chromium' } },
  ],
  webServer: { command: process.env.EARNIST_TEST_PREVIEW ? `npm run preview -- --configLoader native --port ${port} --strictPort` : `npm run dev -- --port ${port} --strictPort`, url, reuseExistingServer: !process.env.CI },
});

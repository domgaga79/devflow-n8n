import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    swc.vite({
      module: {
        type: 'es6',
      },
    }),
  ],

  test: {
    globals: true,
    environment: 'node',

    include: [
      'src/**/*.spec.ts',
    ],

    exclude: [
      'node_modules/**',
      'dist/**',
      'test/**/*.e2e-spec.ts',
      'src/generated/**',
    ],

    coverage: {
      provider: 'v8',

      include: [
        'src/**/*.service.ts',
        'src/**/*.controller.ts',
        'src/**/*.interceptor.ts',
      ],

      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.module.ts',
        'src/generated/**',
      ],

      reporter: [
        'text',
        'html',
        'json-summary',
      ],

      thresholds: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95,
      },
    },
  },
});
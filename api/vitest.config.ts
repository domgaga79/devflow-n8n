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

      reporter: [
        'text',
        'html',
        'lcov',
      ],

      include: [
        'src/**/*.ts',
      ],

      exclude: [
        'src/generated/**',
        'src/main.ts',
        '**/*.module.ts',
        '**/*.dto.ts',
        '**/*.spec.ts',
      ],
    },
  },
});
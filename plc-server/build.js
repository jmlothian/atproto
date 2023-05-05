const { copy } = require('esbuild-plugin-copy')

require('esbuild')
  .build({
    logLevel: 'info',
    entryPoints: ['index.ts'],
    bundle: true,
    sourcemap: true,
    outdir: 'dist',
    platform: 'node',
    external: [
      'pg-native',
    ],
  })
  .catch(() => process.exit(1))

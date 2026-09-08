import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextVitals,
  // Preserve the pre-migration lint policy; framework migration should not mix in unrelated hook rewrites.
  { rules: { 'react-hooks/set-state-in-effect': 'off' } },
  globalIgnores(['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])

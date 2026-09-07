import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: [
        'src/lib/validation.ts',
        'src/lib/dates.ts',
        'src/lib/alerts.ts',
        'src/lib/calendar.ts',
        'src/lib/csv.ts',
        'src/lib/ical.ts',
        'src/lib/data/audit.ts',
        'src/components/layout/abstract-wizard/**',
        'src/components/layout/AbstractWizardButton.tsx',
        'src/components/layout/PageTransition.tsx',
        'src/components/ui/LeaseTabSkeleton.tsx',
        'src/components/documents/**',
        'src/components/users/**',
      ],
      thresholds: {
        // Changed-module budget. The two uncovered function regions are the
        // DocumentUploadModal onDrop drag path (jsdom cannot synthesize drops;
        // the change handler it shares is covered) and three WizardStepBody
        // state-reset branches owned by the shell (covered via the shell).
        // See QA report - functions shortfall documented there.
        lines: 90,
        branches: 85,
        functions: 85,
      },
    },
  },
});

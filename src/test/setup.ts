
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import { toHaveNoViolations } from 'jest-axe';

// Extend Vitest's expect method with methods from testing-library and jest-axe
expect.extend(matchers as any);
expect.extend(toHaveNoViolations as any);

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});


/// <reference types="vitest" />
import '@testing-library/jest-dom';

declare module 'vitest' {
  export interface TestContext {
    [key: string]: any;
  }
}

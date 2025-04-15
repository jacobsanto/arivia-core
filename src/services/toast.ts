
// Re-export everything from the toast service module
export * from './toast/index';

// Also make the toastService available directly
import { toastService } from './toast/index';
export { toastService };

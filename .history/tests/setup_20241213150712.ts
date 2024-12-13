import "@testing-library/jest-dom/vitest";
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => {
  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as any;
  Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
    writable: true,
  });
  server.listen()
});
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
  cleanup();
});
afterAll(() => server.close());
import { createClient } from '@vercel/kv';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Only require KV environment variables in production
if (!isBrowser && !process.env.KV_REST_API_URL && !process.env.KV_REST_API_TOKEN) {
  console.warn('KV_REST_API_URL and KV_REST_API_TOKEN environment variables are not set. Using in-memory fallback.');
}

// Create a mock client for development and browser
const createMockClient = () => ({
  get: async () => null,
  set: async () => 'OK',
  del: async () => 0,
  hgetall: async () => ({}),
  hset: async () => 0,
  // Add other KV methods as needed
});

// Create the KV client based on the environment
const kvClient = !isBrowser && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  : createMockClient();

export default kvClient;

// Setup jsdom with a base URL so react-router NavLink/Link can build URLs
require('jsdom-global')('http://localhost/');

// Optional: provide a global fetch if some components call fetch during render
if (typeof global.fetch === 'undefined') {
  try {
    global.fetch = require('node-fetch');
  } catch (_e) {
    // ignore if node-fetch not available
  }
}

// Provide a minimal localStorage shim if needed (should be present with jsdom)
if (typeof global.localStorage === 'undefined' && typeof window !== 'undefined') {
  global.localStorage = window.localStorage;
}

// Silence specific React Router future-flag warnings in test output
const _warn = console.warn;
console.warn = function (...args) {
  try {
    const msg = args[0] && String(args[0]);
    if (msg && msg.includes('React Router Future Flag')) {
      return; // drop the message
    }
  } catch (e) {
    // ignore
  }
  return _warn.apply(console, args);
};

// Silence specific Postgres foreign-key error logs coming from tests (makes test output noisy)
const _error = console.error;
console.error = function (...args) {
  try {
    const maybe = args[0] && String(args[0]);
    if (maybe && maybe.includes('violates foreign key constraint "feedbacks_user_id_fkey"')) {
      return; // drop FK noise during tests
    }
  } catch (e) {
    // ignore
  }
  return _error.apply(console, args);
};

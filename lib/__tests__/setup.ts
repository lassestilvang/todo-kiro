/**
 * Test setup file
 * Configures test environment and mocks
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.BUN_ENV = 'test';

// Mock the server-only module before any imports
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function (id: string) {
  if (id === 'server-only') {
    return {};
  }
  // eslint-disable-next-line prefer-rest-params
  return originalRequire.apply(this, arguments);
};

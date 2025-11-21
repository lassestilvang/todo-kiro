/**
 * Test setup file
 * Mocks server-only module to allow testing of server-side code
 */

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

/**
 * Component test setup file
 * Sets up happy-dom for component testing
 */

import { Window } from 'happy-dom';

// Create and set up happy-dom window
const window = new Window();
const document = window.document;

// Set globals
global.window = window as unknown as Window & typeof globalThis;
global.document = document as unknown as Document;
global.navigator = window.navigator as Navigator;
global.HTMLElement = window.HTMLElement as typeof HTMLElement;
global.Element = window.Element as typeof Element;
global.Node = window.Node as typeof Node;

// Mock server-only module
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function (id: string) {
  if (id === 'server-only') {
    return {};
  }
  // eslint-disable-next-line prefer-rest-params
  return originalRequire.apply(this, arguments);
};

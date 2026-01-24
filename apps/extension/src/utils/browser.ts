/**
 * Browser compatibility helper
 * Provides unified browser API access
 */

import browser from 'webextension-polyfill';

export { browser };

// Browser detection helpers
export const isChrome = typeof chrome !== 'undefined' && 
                        typeof browser === 'undefined';
export const isFirefox = typeof browser !== 'undefined';

// Export for backwards compatibility
export default browser;

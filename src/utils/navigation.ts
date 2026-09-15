/**
 * Navigation utilities for Letters World
 * Supports smooth redirection through parent window for embedded iframe contexts
 */

export const ATING_UNIVERSE_URL = 'https://ating-universe.vercel.app';

/**
 * Safely redirects to an external URL through the parent/top window if embedded in an iframe,
 * falling back to the current window location.
 */
export function redirectThroughParent(url: string) {
  if (!url) return;

  // 1. Notify parent frame via postMessage
  try {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'NAVIGATE_UNIVERSE', url }, '*');
    }
  } catch {
    // Cross-origin postMessage restrictions fallback
  }

  // 2. Attempt parent window redirection
  try {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.location.href = url;
      return;
    }
  } catch {
    // Parent access may be restricted by cross-origin policy
  }

  // 3. Attempt top window redirection
  try {
    if (typeof window !== 'undefined' && window.top && window.top !== window) {
      window.top.location.href = url;
      return;
    }
  } catch {
    // Top access may be restricted
  }

  // 4. Default window redirect
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
}

export function navigateToExternalLetter(url: string | null) {
  if (!url) return;
  redirectThroughParent(url);
}

export function returnToUniverse() {
  redirectThroughParent(ATING_UNIVERSE_URL);
}


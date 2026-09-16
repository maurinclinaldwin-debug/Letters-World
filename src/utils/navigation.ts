/**
 * Navigation utilities for Letters World
 * Strictly replaces the parent window URL directly into Ating Universe without opening a new tab.
 */

// User provided destination URL (served via HTTPS on Vercel to avoid mixed-content blocks)
export const ATING_UNIVERSE_URL = 'https://ating-universe.vercel.app/';

/**
 * Normalizes destination URL. When the host page is on HTTPS,
 * automatically upgrades to https://ating-universe.vercel.app/
 * to prevent browser mixed-content and insecure navigation blocks.
 */
export function getSafeUniverseUrl(rawUrl: string = ATING_UNIVERSE_URL): string {
  if (!rawUrl) return ATING_UNIVERSE_URL;
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (rawUrl.startsWith('http://')) {
      return rawUrl.replace(/^http:\/\//i, 'https://');
    }
  }
  return rawUrl;
}

/**
 * Strictly replaces the parent window URL, guaranteeing that:
 * 1. Navigation targets `window.parent` and `target="_parent"` (NOT `_top`).
 * 2. It replaces the parent URL without opening a new tab or window.
 * 3. It uses multiple browser-native mechanisms (location.replace, form submit with target="_parent",
 *    synthetic anchor click with target="_parent", and postMessage notification).
 */
export function replaceParentUrl(url: string = ATING_UNIVERSE_URL) {
  const safeUrl = getSafeUniverseUrl(url);

  // 1. Notify parent frame through postMessage (for custom iframe wrappers and hosts)
  try {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'NAVIGATE_UNIVERSE', url: safeUrl, action: 'replace' }, '*');
      window.parent.postMessage({ type: 'PARENT_NAVIGATE', url: safeUrl }, '*');
    }
  } catch {
    // ignore cross-origin postMessage restrictions
  }

  // 2. Direct parent location replacement (STRICTLY parent, not top)
  let parentReplaced = false;
  try {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      if (typeof window.parent.location?.replace === 'function') {
        window.parent.location.replace(safeUrl);
        parentReplaced = true;
      } else {
        window.parent.location.href = safeUrl;
        parentReplaced = true;
      }
    }
  } catch {
    // Cross-origin restriction might block direct parent property writes
  }

  // 3. Programmatic Form Submit with target="_parent"
  // Browser engines allow cross-origin form submissions with target="_parent"
  // even in sandboxed environments where direct script location access is restricted.
  try {
    if (typeof document !== 'undefined') {
      const form = document.createElement('form');
      form.method = 'GET';
      form.action = safeUrl;
      form.target = '_parent'; // strictly _parent
      form.style.position = 'fixed';
      form.style.left = '-9999px';
      form.style.top = '-9999px';
      form.style.opacity = '0';
      form.style.pointerEvents = 'none';
      document.body.appendChild(form);
      form.submit();
      setTimeout(() => {
        try {
          if (form.parentNode) document.body.removeChild(form);
        } catch {}
      }, 2000);
      parentReplaced = true;
    }
  } catch {
    // ignore
  }

  // 4. Programmatic anchor click targeted strictly at _parent
  try {
    if (typeof document !== 'undefined') {
      const link = document.createElement('a');
      link.href = safeUrl;
      link.target = '_parent'; // strictly _parent
      link.rel = 'noreferrer';
      link.style.position = 'fixed';
      link.style.left = '-9999px';
      link.style.top = '-9999px';
      link.style.opacity = '0';
      link.style.pointerEvents = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        try {
          if (link.parentNode) document.body.removeChild(link);
        } catch {}
      }, 2000);
      parentReplaced = true;
    }
  } catch {
    // ignore
  }

  // 5. Standalone window fallback (when not inside an iframe)
  if (typeof window !== 'undefined' && (!window.parent || window.parent === window)) {
    try {
      window.location.replace(safeUrl);
    } catch {
      window.location.href = safeUrl;
    }
  }

  return parentReplaced;
}

// Alias for backward compatibility
export const redirectThroughParent = replaceParentUrl;

export function navigateToExternalLetter(url: string | null) {
  if (!url) return;
  replaceParentUrl(url);
}

export function returnToUniverse() {
  replaceParentUrl(ATING_UNIVERSE_URL);
}



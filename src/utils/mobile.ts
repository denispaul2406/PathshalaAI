/**
 * Mobile utility functions
 */

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Check if device is iOS
 */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Check if device is Android
 */
export function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}

/**
 * Get viewport height (handles mobile browser address bar)
 */
export function getViewportHeight(): number {
  return window.visualViewport?.height || window.innerHeight;
}

/**
 * Prevent zoom on double tap (mobile)
 */
export function preventDoubleTapZoom(): void {
  let lastTouchEnd = 0;
  document.addEventListener(
    'touchend',
    (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    },
    false
  );
}

/**
 * Add viewport height CSS variable for mobile
 */
export function setupMobileViewport(): void {
  const setVH = () => {
    const vh = getViewportHeight() * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);
  
  // iOS specific
  if (isIOS()) {
    window.visualViewport?.addEventListener('resize', setVH);
  }
}


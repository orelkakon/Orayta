export const THEME_KEY = 'orayta_theme';
export const DARK_MQ = '(prefers-color-scheme: dark)';

/** Inline pre-paint script (root layout): applies the stored theme before
 *  React hydrates, so dark-mode users never see a light flash. Lives outside
 *  the 'use client' ThemeContext so the server layout can inline the string. */
export const THEME_BOOT_SCRIPT =
  `try{var m=localStorage.getItem('${THEME_KEY}');` +
  `if(m==='dark'||(m==='system'&&matchMedia('${DARK_MQ}').matches))` +
  `document.documentElement.setAttribute('data-theme','dark')}catch(e){}`;

/** Inline script (root layout): on iPhone / iPad only, adds maximum-scale=1 to
 *  the viewport so focusing a field never auto-zooms the page (which also threw
 *  the keyboard-height editor sheets off). iOS keeps pinch-zoom regardless of
 *  maximum-scale, so nobody loses zoom; other platforms are left untouched,
 *  since there it would block pinch-zoom. */
export const IOS_VIEWPORT_SCRIPT =
  `(function(){var n=navigator;if(!(/iP(hone|od|ad)/.test(n.userAgent)||(n.platform==='MacIntel'&&n.maxTouchPoints>1)))return;` +
  `function f(){var m=document.querySelector('meta[name="viewport"]');` +
  `if(m&&m.content.indexOf('maximum-scale')<0)m.content+=', maximum-scale=1';return!!m}` +
  `if(!f())document.addEventListener('DOMContentLoaded',f)})()`;

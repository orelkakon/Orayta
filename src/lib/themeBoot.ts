export const THEME_KEY = 'orayta_theme';
export const DARK_MQ = '(prefers-color-scheme: dark)';

/** Inline pre-paint script (root layout): applies the stored theme before
 *  React hydrates, so dark-mode users never see a light flash. Lives outside
 *  the 'use client' ThemeContext so the server layout can inline the string. */
export const THEME_BOOT_SCRIPT =
  `try{var m=localStorage.getItem('${THEME_KEY}');` +
  `if(m==='dark'||(m==='system'&&matchMedia('${DARK_MQ}').matches))` +
  `document.documentElement.setAttribute('data-theme','dark')}catch(e){}`;

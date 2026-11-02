/* Home "בסביבתך" hub (minyan · mikveh · kivrei) — spread into HE (src/lib/hebrewTexts.ts). */
export const NEARBY_HE = {
  NB_EYEBROW: 'בסביבתך',
  NB_TITLE: 'מה קרוב אליך?',
  NB_SUB: 'מניין, מקווה וציוני צדיקים — על המפה, לפי המיקום שלך',
  NB_ARIA: 'שירותים בסביבתך',
  NB_TILES: [
    { href: '/minyan', icon: 'synagogue', label: 'מניין קרוב', sub: 'בתי כנסת וזמני תפילה' },
    { href: '/mikveh', icon: 'droplet', label: 'מקווה', sub: 'נשים · גברים · כלים' },
    { href: '/kivrei', icon: 'tomb', label: 'קברי צדיקים', sub: 'ציונים והילולות' },
  ] as { href: string; icon: string; label: string; sub: string }[],
};

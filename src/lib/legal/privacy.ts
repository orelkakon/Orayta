import type { LegalDoc } from '@/types';
import { PRIVACY_COLLECT } from './privacyCollect';
import { PRIVACY_SHARE } from './privacyShare';

/* Written against what the code actually does — when a feature starts
   collecting, storing or forwarding data, update this policy with it. */
export const PRIVACY: LegalDoc = {
  id: 'privacy',
  title: 'מדיניות פרטיות',
  summary: [
    'אין צורך להירשם. אין באתר פרסומות, אין כלי אנליטיקה של צד שלישי ואין עוגיות מעקב משלנו.',
    'אנחנו אוספים רק מה שאתם בוחרים למסור (תגובה, הקדשה, פנייה, כינוי במשחק או הרשמה להתראות), וגרסה מגובבת של כתובת ה-IP כדי למנוע שימוש לרעה ולספור מבקרים.',
    'המיקום משמש רק לחיפוש ולחישוב, ואינו נשמר אצלנו.',
    'איננו מוכרים מידע ואיננו משתמשים בו לפרסום או לשיווק.',
    'אפשר לעיין במידע, לתקן אותו או לבקש למחוק אותו בכל עת.',
  ],
  sections: [...PRIVACY_COLLECT, ...PRIVACY_SHARE],
};

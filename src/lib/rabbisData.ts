import { RabbiCategory } from '@/types';

export const CATEGORY_LABELS: Record<RabbiCategory, string> = {
  zugot: 'זוגות',
  tannaim: 'תנאים',
  amoraim: 'אמוראים',
  geonim: 'גאונים',
  rishonim: 'ראשונים',
  acharonim: 'אחרונים',
  hasidim: 'חסידים',
  abuchatzira: 'אבוחצירא',
  late: 'אחרוני אחרונים',
};

export const CATEGORY_ORDER: RabbiCategory[] = [
  'zugot', 'tannaim', 'amoraim', 'geonim', 'rishonim',
  'acharonim', 'hasidim', 'abuchatzira', 'late',
];

export const CATEGORY_COLORS: Record<RabbiCategory, string> = {
  zugot: '#5C3D1E',
  tannaim: '#7A3B10',
  amoraim: '#9B2335',
  geonim: '#2D6A4F',
  rishonim: '#1A5C8A',
  acharonim: '#5B3880',
  hasidim: '#B07A2A',
  abuchatzira: '#C4956A',
  late: '#374151',
};

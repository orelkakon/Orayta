import { RabbiCategory } from '@/types';

export const CATEGORY_LABELS: Record<RabbiCategory, string> = {
  torah:      'תורה',
  neviim:     'נביאים',
  shoftim:    'שופטים',
  melachim:   'מלכים',
  ketuvim:    'כתובים',
  zugot:      'זוגות',
  tannaim:    'תנאים',
  amoraim:    'אמוראים',
  geonim:     'גאונים',
  rishonim:   'ראשונים',
  acharonim:  'אחרונים',
  hasidim:    'חסידים',
  abuchatzira:'אבוחצירא',
  late:       'אחרוני אחרונים',
};

export const CATEGORY_ORDER: RabbiCategory[] = [
  'torah', 'shoftim', 'melachim', 'neviim', 'ketuvim',
  'zugot', 'tannaim', 'amoraim', 'geonim', 'rishonim',
  'acharonim', 'hasidim', 'abuchatzira', 'late',
];

export const CATEGORY_COLORS: Record<RabbiCategory, string> = {
  torah:      '#1A3A6B',
  neviim:     '#2D5A3D',
  shoftim:    '#7A4A1E',
  melachim:   '#4A2C6B',
  ketuvim:    '#5B3880',
  zugot:      '#5C3D1E',
  tannaim:    '#7A3B10',
  amoraim:    '#9B2335',
  geonim:     '#2D6A4F',
  rishonim:   '#1A5C8A',
  acharonim:  '#5B3880',
  hasidim:    '#B07A2A',
  abuchatzira:'#C4956A',
  late:       '#374151',
};

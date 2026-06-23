export type Amud = 'א' | 'ב';

export interface CitationLocation {
  id: string;
  masechet: string;
  seder: string;
  daf: string;
  amud: Amud | null;
}

export interface Citation {
  id: string;
  content: string;
  locations: CitationLocation[];
  createdAt: string;
  updatedAt: string;
}

export interface MasechetInfo {
  name: string;
  seder: string;
}

export interface QuizQuestion {
  citation: Citation;
}

export interface QuizAnswer {
  citationId: string;
  masechet: string;
  daf: string;
  amud: Amud | null;
}

export interface QuizResult {
  score: number;
  correctLocations: CitationLocation[];
}

export interface QuizStats {
  total: number;
  totalScore: number;
  accuracy: number;
  recentResults: Array<{
    score: number;
    answeredAt: string;
    citationContent: string;
  }>;
}

export type RabbiCategory = 'torah' | 'neviim' | 'shoftim' | 'melachim' | 'ketuvim' | 'zugot' | 'tannaim' | 'amoraim' | 'geonim' | 'rishonim' | 'acharonim' | 'hasidim' | 'abuchatzira' | 'late';

export interface Rabbi {
  id: string;
  name: string;
  fullName: string | null;
  sortYear: number;
  datePeriod: string;
  isAlive: boolean;
  bio: string;
  category: string;
  deathDate: string | null;
  createdAt: string;
}

export interface CitationFilters {
  masechet?: string;
  seder?: string;
  search?: string;
}

export interface Gematria {
  id: string;
  word: string;
  value: number;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  rabbiId: string | null;
  createdAt: string;
}

export interface Chidush {
  id: string;
  text: string;
  source: string | null;
  author: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Dedication {
  id: string;
  type: string;
  name: string;
  createdAt: string;
}

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
  isCorrect: boolean;
  correctLocations: CitationLocation[];
}

export interface QuizStats {
  total: number;
  correct: number;
  accuracy: number;
  recentResults: Array<{
    isCorrect: boolean;
    answeredAt: string;
    citationContent: string;
  }>;
}

export interface CitationFilters {
  masechet?: string;
  seder?: string;
  search?: string;
}

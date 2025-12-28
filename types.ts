
export enum JobType {
  CONSTRUCTION = 'Construção Civil',
  ELECTRICAL = 'Serviços em Eletricidade (NR-10)',
  HEIGHTS = 'Trabalho em Altura (NR-35)',
  CHEMICAL = 'Manipulação Química',
  WELDING = 'Soldagem e Corte',
  GENERAL = 'Manutenção Geral'
}

export interface PPEItem {
  name: string;
  status: 'present' | 'missing' | 'incorrect';
  observation: string;
  // Coordenadas normalizadas [ymin, xmin, ymax, xmax] de 0 a 1000
  location?: number[]; 
}

export interface SafetyAnalysis {
  workerDetected: boolean;
  jobContext: string;
  identifiedPPE: PPEItem[];
  missingCriticalPPE: string[];
  complianceScore: number;
  relevantNRs: string[];
  finalVerdict: 'approved' | 'restricted' | 'critical';
  recommendations: string[];
}

export interface InspectionRecord {
  id: string;
  timestamp: string;
  image: string;
  analysis: SafetyAnalysis;
  jobType: JobType;
}

export interface AppState {
  currentImage: string | null;
  selectedJob: JobType;
  isAnalyzing: boolean;
  result: SafetyAnalysis | null;
  error: string | null;
  view: 'main' | 'history';
  history: InspectionRecord[];
}

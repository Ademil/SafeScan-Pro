
import { JobType } from './types';

export const JOB_REQUIREMENTS: Record<JobType, string> = {
  [JobType.CONSTRUCTION]: "Capacete de segurança, botas com biqueira, colete refletivo, luvas de proteção, protetor auricular.",
  [JobType.ELECTRICAL]: "EPIs dielétricos (não condutivos), capacete classe B, vestimenta retardante de chama (classe de risco 2), luvas isolantes, botas sem metais.",
  [JobType.HEIGHTS]: "Cinturão de segurança tipo paraquedista, talabarte, capacete com jugular, botas antiderrapantes, luvas.",
  [JobType.CHEMICAL]: "Avental impermeável, luvas de nitrilo ou neoprene, máscara com filtro químico, óculos de ampla visão (goggles), botas impermeáveis.",
  [JobType.WELDING]: "Máscara de solda (escurecimento automático), avental de raspa, luvas de cano longo (raspa), perneiras, bota de segurança, protetor auricular.",
  [JobType.GENERAL]: "Óculos de proteção, luvas de vaqueta, botas de segurança, uniforme padrão."
};

export const ANALYSIS_SYSTEM_INSTRUCTION = `
Você é um Engenheiro de Segurança do Trabalho especialista em Visão Computacional e NRs brasileiras.
Sua tarefa é analisar fotos de trabalhadores e detectar EPIs com precisão cirúrgica.

REGRAS DE OURO:
1. Identifique o trabalhador e cada item de EPI.
2. Para cada item identificado (ou ausente mas detectado o local onde deveria estar), forneça a localização no formato [ymin, xmin, ymax, xmax] usando coordenadas normalizadas de 0 a 1000.
3. Se um item está ausente (ex: falta capacete), aponte a localização da cabeça do trabalhador.
4. Status: 'present' (detectado e correto), 'missing' (obrigatório mas não detectado), 'incorrect' (detectado mas usado de forma errada, ex: capacete sem jugular).

RESPOSTA JSON OBRIGATÓRIA:
{
  "workerDetected": boolean,
  "jobContext": string,
  "identifiedPPE": [
    {
      "name": string, 
      "status": "present"|"missing"|"incorrect", 
      "observation": string,
      "location": [number, number, number, number]
    }
  ],
  "missingCriticalPPE": [string],
  "complianceScore": number,
  "relevantNRs": [string],
  "finalVerdict": "approved"|"restricted"|"critical",
  "recommendations": [string]
}
`;
